import { style } from '@vanilla-extract/css';


export default {
  progress: style({
    // background-color: ${({ bgColor }) => rgba(bgColor)};
    // border-left-color: ${({ fgColor }) => rgba(fgColor)};
    // border-left-width: ${({ progress }) => (progress || 0) * 100}vw;
    borderLeftStyle: 'solid',
    height: '4px',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    transition: 'border-left-width 0.2s ease-in, height 0.2s linear',
    ':hover': {
      cursor: 'pointer',
      height: '10px'
    }
  })
};
