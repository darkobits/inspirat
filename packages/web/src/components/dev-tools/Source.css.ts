import { style, createVar, globalStyle } from '@vanilla-extract/css';


export const vars = {
  input: {
    backgroundColor: createVar(),
    borderColor: createVar(),
    boxShadow: createVar(),
    color: createVar(),
    height: createVar(),
    lineHeight: createVar(),
    focus: {
      boxShadow: createVar(),
      backgroundColor: createVar(),
      borderColor: createVar()
    },
    placeholder: {
      color: createVar()
    },
    selection: {
      backgroundColor: createVar()
    }
  }
};

const classes = {
  source: style({
    width: '100%',
    marginRight: '12px',
    backdropFilter: 'blur(20px)'
  })
};

globalStyle(`${classes.source} input`, {
  backgroundColor: vars.input.backgroundColor,
  backdropFilter: 'blur(10px)',
  borderRadius: '4px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: vars.input.borderColor,
  boxShadow: vars.input.boxShadow,
  color: vars.input.color,
  fontSize: 'inherit',
  fontWeight: 400,
  padding: '0px 10px',
  width: '100%',
  transition: 'all 0.15s ease-in-out'
});

globalStyle(`${classes.source} input:focus`, {
  outline: 'none',
  boxShadow: vars.input.focus.boxShadow,
  backgroundColor: vars.input.focus.backgroundColor,
  borderColor: vars.input.focus.borderColor
});

globalStyle(`${classes.source} input::placeholder`, {
  color: vars.input.placeholder.color
});

globalStyle(`${classes.source} input::selection`, {
  backgroundColor: vars.input.selection.backgroundColor
});


export default classes;
