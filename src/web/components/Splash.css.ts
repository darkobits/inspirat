import { style } from '@vanilla-extract/css';

export default {
  splash: style({
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    padding: '14px 18px',
    width: '100%',
    transition: 'opacity 1.2s ease-in-out'
  })
};
