import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {makeStyles} from '@material-ui/core/styles';

const containerStyle = {
  position: 'absolute',
  zIndex: 1,
  bottom: 40,
  left: 20,
  width: '20%',
  minWidth: 300
};

const useStyles = makeStyles(theme => ({
  inputRoot: {
    backgroundColor: '#fff !important',
    boxShadow: '0 0 8px rgba(0,0,0,0.15)'
  }
}));

const MAX_OPTIONS = 30;

function filterOptions(options, {inputValue}) {
  if (!inputValue) return [];

  const result = [];
  const testExp = new RegExp(inputValue.replace(/[^\-\w]/g, ''), 'i');
  for (const station of options) {
    if (station.callSign.search(testExp) === 0) {
      result.push(station);
    }
    if (result.length >= MAX_OPTIONS) {
      return result;
    }
  }
  for (const station of options) {
    if (station.name.search(testExp) === 0) {
      result.push(station);
    }
    if (result.length >= MAX_OPTIONS) {
      return result;
    }
  }

  return result;
}

function SearchBar(props) {
  const classes = useStyles();

  return (
    props.data && (
      <Autocomplete
        id="combo-box-demo"
        classes={classes}
        options={props.data}
        filterOptions={filterOptions}
        getOptionLabel={option => `(${option.callSign}) ${option.name}`}
        noOptionsText=""
        size="small"
        style={containerStyle}
        renderInput={params => <TextField {...params} label="Search..." variant="filled" />}
        onChange={(source, selectedOption) => props.onChange(selectedOption)}
      />
    )
  );
}

export default React.memo(SearchBar);
