import React, { memo } from 'react';
import PropTypes from 'prop-types';
import {
  TableRow,
  TableCell,
  Skeleton
} from '@mui/material';

const LoadingSkeleton = memo(({ columns, rowsPerPage, hasCheckbox, hasExpand }) => {
  // 전체 컬럼 수 계산 (체크박스, 확장 버튼 포함)
  const totalColumns = columns.length + (hasCheckbox ? 1 : 0) + (hasExpand ? 1 : 0);

  return (
    <React.Fragment>
      {[...Array(rowsPerPage)].map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {hasCheckbox && (
            <TableCell padding="checkbox">
              <Skeleton 
                variant="rectangular" 
                width={24} 
                height={24} 
                sx={{ borderRadius: 0.5 }}
              />
            </TableCell>
          )}
          {hasExpand && (
            <TableCell padding="checkbox">
              <Skeleton 
                variant="rectangular" 
                width={24} 
                height={24} 
                sx={{ borderRadius: 0.5 }}
              />
            </TableCell>
          )}
          {columns.map((column, colIndex) => (
            <TableCell key={column.id || colIndex}>
              <Skeleton
                animation="wave"
                width={column.width || '100%'}
                height={24}
                sx={{
                  borderRadius: 0.5,
                  ...(column.numeric && { marginLeft: 'auto' })
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </React.Fragment>
  );
});

LoadingSkeleton.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      numeric: PropTypes.bool
    })
  ).isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  hasCheckbox: PropTypes.bool,
  hasExpand: PropTypes.bool
};

LoadingSkeleton.defaultProps = {
  hasCheckbox: false,
  hasExpand: false
};

export default LoadingSkeleton;