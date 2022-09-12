import { style, globalStyle } from '@vanilla-extract/css';


const classes = {
  devTools: style({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '12px 10px 0px 10px',
    pointerEvents: 'none',
    position: 'fixed',
    right: 0,
    top: 0,
    width: '100%',
    zIndex: 1
  })
};

globalStyle(`${classes.devTools} *`, {
  pointerEvents: 'initial'
});

export default classes;
