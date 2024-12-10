import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import koLocale from 'date-fns/locale/ko';

const FilterPanel = ({ filters, onFilterChange }) => {
  const handleDateChange = (type) => (date) => {
    onFilterChange({
      ...filters,
      [type]: date ? date.toISOString().split('T')[0] : ''
    });
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    onFilterChange({
      ...filters,
      [name]: value
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* 날짜 필터 */}
          <DatePicker
            label="시작일"
            value={filters.startDate ? new Date(filters.startDate) : null}
            onChange={handleDateChange('startDate')}
            renderInput={(params) => (
              <TextField {...params} size="small" sx={{ width: 200 }} />
            )}
          />
          
          <DatePicker
            label="종료일"
            value={filters.endDate ? new Date(filters.endDate) : null}
            onChange={handleDateChange('endDate')}
            renderInput={(params) => (
              <TextField {...params} size="small" sx={{ width: 200 }} />
            )}
          />

          {/* 성별 필터 */}
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>성별</InputLabel>
            <Select
              name="gender"
              value={filters.gender || ''}
              label="성별"
              onChange={handleSelectChange}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="남">남</MenuItem>
              <MenuItem value="여">여</MenuItem>
            </Select>
          </FormControl>

          {/* 연령대 필터 */}
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>연령대</InputLabel>
            <Select
              name="ageRange"
              value={filters.ageRange || ''}
              label="연령대"
              onChange={handleSelectChange}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="20">20대</MenuItem>
              <MenuItem value="30">30대</MenuItem>
              <MenuItem value="40">40대</MenuItem>
              <MenuItem value="50">50대</MenuItem>
              <MenuItem value="60">60대 이상</MenuItem>
            </Select>
          </FormControl>

          {/* 증상 유형 필터 */}
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel>증상 유형</InputLabel>
            <Select
              name="symptomType"
              value={filters.symptomType || ''}
              label="증상 유형"
              onChange={handleSelectChange}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="근골격계">근골격계</MenuItem>
              <MenuItem value="소화기계">소화기계</MenuItem>
              <MenuItem value="호흡기계">호흡기계</MenuItem>
              <MenuItem value="순환기계">순환기계</MenuItem>
              <MenuItem value="신경계">신경계</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default FilterPanel;