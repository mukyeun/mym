import React, { memo } from 'react';
import PropTypes from 'prop-types';
import {
  TableRow,
  TableCell,
  Checkbox,
  IconButton
} from '@mui/material';
import {
  KeyboardArrowRight as ExpandIcon,
  KeyboardArrowDown as CollapseIcon
} from '@mui/icons-material';

const DataRow = memo(({
  row,
  columns,
  onSelectItem,
  expandable,
  onRowClick,
  selectedItems,
  isExpanded,
  onExpandRow,
  renderExpandedRow
}) => (
  <React.Fragment>
    <TableRow
      hover
      onClick={onRowClick ? () => onRowClick(row) : undefined}
      selected={selectedItems?.includes(row.id)}
      sx={{ 
        cursor: onRowClick ? 'pointer' : 'default',
        '&.MuiTableRow-hover:hover': {
          backgroundColor: 'action.hover'
        }
      }}
    >
      {onSelectItem && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={selectedItems?.includes(row.id)}
            onChange={(event) => {
              event.stopPropagation();
              onSelectItem(row.id);
            }}
          />
        </TableCell>
      )}
      {expandable && (
        <TableCell padding="checkbox">
          <IconButton 
            size="small" 
            onClick={(event) => {
              event.stopPropagation();
              onExpandRow(row.id);
            }}
          >
            {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </TableCell>
      )}
      {columns.map((column) => (
        <TableCell
          key={column.id}
          align={column.numeric ? 'right' : 'left'}
          padding={column.disablePadding ? 'none' : 'normal'}
        >
          {column.render ? column.render(row) : row[column.id]}
        </TableCell>
      ))}
    </TableRow>
    {expandable && isExpanded && (
      <TableRow>
        <TableCell 
          colSpan={columns.length + (onSelectItem ? 2 : 1)}
          sx={{ py: 0 }}
        >
          {renderExpandedRow(row)}
        </TableCell>
      </TableRow>
    )}
  </React.Fragment>
));

DataRow.propTypes = {
  row: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      numeric: PropTypes.bool,
      disablePadding: PropTypes.bool,
      render: PropTypes.func
    })
  ).isRequired,
  onSelectItem: PropTypes.func,
  expandable: PropTypes.bool,
  onRowClick: PropTypes.func,
  selectedItems: PropTypes.array,
  isExpanded: PropTypes.bool,
  onExpandRow: PropTypes.func,
  renderExpandedRow: PropTypes.func
};

export default DataRow;