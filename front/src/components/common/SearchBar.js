import React from 'react';
import { 
  Paper,
  InputBase,
  IconButton,
  Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const SearchBar = ({ 
  value, 
  onChange, 
  onSearch,
  placeholder = '이름으로 검색...',
  width = '100%'
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  const handleClear = () => {
    onChange({ target: { value: '' } });
    onSearch();
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width,
        mb: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        inputProps={{ 'aria-label': 'search health info' }}
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {value && (
          <IconButton 
            type="button" 
            sx={{ p: '10px' }} 
            aria-label="clear"
            onClick={handleClear}
          >
            <ClearIcon />
          </IconButton>
        )}
        
        <IconButton 
          type="submit" 
          sx={{ p: '10px' }} 
          aria-label="search"
        >
          <SearchIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default SearchBar;