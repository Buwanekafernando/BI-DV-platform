import os
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
from typing import List, Dict, Any
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from config import settings
from models.schemas import ChartRequest
from services.chart_formatter import ChartFormatter
from utils.validators import apply_filters

class ReportGenerator:
    """Service for generating professional PDF and CSV reports"""
    
    @staticmethod
    def generate_csv_report(
        file_path: str,
        output_filename: str,
        filters: List[Any] = None
    ) -> str:
        """Generate CSV export of filtered data"""
        df = pd.read_csv(file_path)
        
        # Apply filters if provided
        if filters:
            df = apply_filters(df, filters)
        
        # Save to reports directory
        output_path = os.path.join(settings.REPORT_DIR, output_filename)
        df.to_csv(output_path, index=False)
        
        return output_path
    
    @staticmethod
    def generate_pdf_report(
        file_path: str,
        output_filename: str,
        title: str,
        chart_configs: List[ChartRequest] = None,
        filters: List[Any] = None
    ) -> str:
        """Generate professional PDF report"""
        output_path = os.path.join(settings.REPORT_DIR, output_filename)
        
        # Create PDF document
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=1*inch,
            bottomMargin=0.75*inch
        )
        
        # Container for PDF elements
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#34495e'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Header Section
        story.append(Paragraph(settings.PROJECT_NAME, styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 0.3*inch))
        
        # Dataset Summary Section
        story.append(Paragraph("Dataset Summary", heading_style))
        df = pd.read_csv(file_path)
        
        if filters:
            df = apply_filters(df, filters)
        
        summary_data = [
            ["Metric", "Value"],
            ["Total Rows", str(len(df))],
            ["Total Columns", str(len(df.columns))],
            ["Report Generated", datetime.now().strftime("%Y-%m-%d %H:%M:%S")]
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 3*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        
        story.append(summary_table)
        story.append(Spacer(1, 0.4*inch))
        
        # Statistics Section
        story.append(Paragraph("Data Insights", heading_style))
        
        numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
        if len(numeric_cols) > 0:
            stats_data = [["Column", "Mean", "Median", "Min", "Max"]]
            
            for col in numeric_cols[:5]:  # Limit to 5 columns
                stats_data.append([
                    col,
                    f"{df[col].mean():.2f}",
                    f"{df[col].median():.2f}",
                    f"{df[col].min():.2f}",
                    f"{df[col].max():.2f}"
                ])
            
            stats_table = Table(stats_data)
            stats_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495e')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey)
            ]))
            
            story.append(stats_table)
            story.append(Spacer(1, 0.4*inch))
        
        # Charts Section
        if chart_configs:
            story.append(PageBreak())
            story.append(Paragraph("Visualizations", heading_style))
            story.append(Spacer(1, 0.2*inch))
            
            for idx, chart_config in enumerate(chart_configs[:4]):  # Limit to 4 charts
                chart_image_path = ReportGenerator._generate_chart_image(
                    file_path, chart_config, f"chart_{idx}.png"
                )
                
                if chart_image_path and os.path.exists(chart_image_path):
                    img = Image(chart_image_path, width=5*inch, height=3*inch)
                    story.append(img)
                    story.append(Spacer(1, 0.3*inch))
        
        # Disclaimer Section
        story.append(PageBreak())
        disclaimer_text = """
        <b>Disclaimer:</b><br/>
        This report is system-generated based on the uploaded dataset and selected parameters. 
        The accuracy of insights depends on data quality. Please verify critical information 
        before making business decisions.
        """
        story.append(Paragraph(disclaimer_text, styles['Normal']))
        
        # Build PDF with custom footer
        doc.build(story, onFirstPage=ReportGenerator._add_page_footer, 
                  onLaterPages=ReportGenerator._add_page_footer)
        
        return output_path
    
    @staticmethod
    def _add_page_footer(canvas, doc):
        """Add footer to each page"""
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(colors.grey)
        
        # Page number
        page_num = canvas.getPageNumber()
        text = f"Page {page_num}"
        canvas.drawRightString(A4[0] - 0.75*inch, 0.5*inch, text)
        
        # Generation date
        date_text = f"Generated: {datetime.now().strftime('%Y-%m-%d')}"
        canvas.drawString(0.75*inch, 0.5*inch, date_text)
        
        canvas.restoreState()
    
    @staticmethod
    def _generate_chart_image(file_path: str, chart_config: ChartRequest, filename: str) -> str:
        """Generate chart image for PDF embedding"""
        try:
            df = pd.read_csv(file_path)
            
            if chart_config.filters:
                df = apply_filters(df, chart_config.filters)
            
            plt.figure(figsize=(10, 6))
            
            # Generate appropriate chart based on config
            if chart_config.x_column and chart_config.y_column:
                if chart_config.category_column:
                    # Grouped bar chart
                    grouped = df.groupby([chart_config.x_column, chart_config.category_column])[chart_config.y_column].sum().unstack()
                    grouped.plot(kind='bar', ax=plt.gca())
                else:
                    # Simple bar or line chart
                    df_plot = df.groupby(chart_config.x_column)[chart_config.y_column].sum()
                    df_plot.plot(kind='bar', ax=plt.gca())
                
                plt.xlabel(chart_config.x_column)
                plt.ylabel(chart_config.y_column)
            else:
                # Default: value counts of first column
                df[df.columns[0]].value_counts().head(10).plot(kind='bar')
            
            plt.title("Data Visualization")
            plt.tight_layout()
            
            # Save image
            image_path = os.path.join(settings.REPORT_DIR, filename)
            plt.savefig(image_path, dpi=150, bbox_inches='tight')
            plt.close()
            
            return image_path
        except Exception as e:
            print(f"Error generating chart: {e}")
            return None
