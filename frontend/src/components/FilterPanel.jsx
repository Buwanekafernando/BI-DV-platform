function FilterPanel({ filters, setFilters }) {
    return (
        <div className="filter-panel" style={{ flex: 1, marginRight: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Filters:</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Category (e.g. Asia)"
                    onChange={e => setFilters({ ...filters, category: e.target.value })}
                />
            </div>
        </div>
    );
}

export default FilterPanel;
