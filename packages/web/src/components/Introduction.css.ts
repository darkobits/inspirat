import { style, globalStyle } from '@vanilla-extract/css';


const classes = {
  introduction: style({})
};

globalStyle(`${classes.introduction} a`, {
  color: 'inherit',
  transition: 'all 0.25s ease-in-out',
  textShadow: '0px 0px 1px rgba(255, 255, 255, 1)'
});

globalStyle(`${classes.introduction} a:hover`, {
  textShadow: '0px 0px 1px rgba(255, 255, 255, 1), 0px 0px 6px rgba(255, 255, 255, 0.66)'
});


export default classes;
