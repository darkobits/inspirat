import { fontFace } from '@vanilla-extract/css';

import TitleBoldWoff2Src from 'assets/fonts/225fe9c9441c34abf68a2de700f7e868.woff2';
import RegularWoff2Src from 'assets/fonts/25254eecedd0d2c685d884be9846962b.woff2';
import TitleBoldWoffSrc from 'assets/fonts/7586b7047f60d3a2e0e7d21df14c568d.woff';
import TitleVariableWoff2Src from 'assets/fonts/7658d9c8211dd8a6b350b6507f7fdd1a.woff2';
import TitleExtraboldWoffSrc from 'assets/fonts/8c25b5f2bcdcb01fa5891cf47627a617.woff';
import RegularWoffSrc from 'assets/fonts/c9b854c5c634fa9f345c2992d1dfeadd.woff';
import TitleExtraboldWoff2Src from 'assets/fonts/ddcdc793890f945f9544f67a152a4165.woff2';
import BoldWoff2Src from 'assets/fonts/e9e1a3c95ac9706bd3a804e75f4f4631.woff2';
import BoldWoffSrc from 'assets/fonts/edc4dae184d959b625d5bb67dba44a27.woff';

const unicodeRange = 'u+0020-007e,u+00a0-00ac,u+00ae-0137,u+0139-0148,u+014a-017e,u+018f,u+01a0-01a1,u+01af-01b0,u+01cd-01d4,u+01e6-01e7,u+01f4-01f5,u+01fa-01ff,u+0218-021b,u+0226-0227,u+0232-0233,u+0237,u+0259,u+02bc,u+02c6-02c7,u+02d8-02dd,u+0300-0304,u+0306-030c,u+0312,u+031b,u+0323,u+0326-0328,u+0335-0338,u+0394,u+03a9,u+03bc,u+03c0,u+0e3f,u+1e0c-1e0d,u+1e20-1e21,u+1e24-1e25,u+1e36-1e37,u+1e44-1e45,u+1e56-1e57,u+1e62-1e63,u+1e6c-1e6d,u+1e80-1e85,u+1e8a-1e8d,u+1e92-1e93,u+1e9e,u+1ea0-1ef9,u+2002-2003,u+2009-200a,u+2010-2011,u+2013-2015,u+2018-201a,u+201c-201e,u+2020-2022,u+2026,u+2030,u+2032-2033,u+2039-203a,u+2044,u+2070,u+2074-2079,u+2080-2089,u+20a6,u+20a9-20aa,u+20ac,u+20b4,u+20b8-20ba,u+20bd,u+20bf,u+2113,u+2116-2117,u+2122,u+2126,u+2160-2169,u+216c-216f,u+2190-2193,u+2196-2199,u+2202,u+2206,u+220f,u+2211-2212,u+2215,u+221a,u+221e,u+222b,u+2248,u+2260,u+2264-2265,u+fb01-fb02,u+ffff';

export const FontText = fontFace([{
  fontDisplay: 'swap',
  fontWeight: 400,
  src: [
    `url("${RegularWoff2Src}") format("woff2")`,
    `url("${RegularWoffSrc}") format("woff")`
  ].join(', '),
  unicodeRange
}, {
  fontDisplay: 'swap',
  fontWeight: 700,
  src: [
    `url("${BoldWoff2Src}") format("woff2")`,
    `url("${BoldWoffSrc}") format("woff")`
  ].join(', '),
  unicodeRange
}]);

export const FontDisplayVariable = fontFace([{
  fontDisplay: 'swap',
  // fontWeight: 700,
  fontWeight: '100 750',
  unicodeRange,
  src: [
    `url("${TitleVariableWoff2Src}") format("woff2 supports variations")`,
    `url("${TitleVariableWoff2Src}") format("woff2-variations")`,
    `url("${TitleBoldWoff2Src}") format("woff2")`,
    `url("${TitleBoldWoffSrc}") format("woff")`
  ].join(', ')
}, {
  fontDisplay: 'swap',
  // fontWeight: 800,
  fontWeight: '750 1000',
  unicodeRange,
  src: [
    `url("${TitleVariableWoff2Src}") format("woff2 supports variations")`,
    `url("${TitleVariableWoff2Src}") format("woff2-variations")`,
    `url("${TitleExtraboldWoff2Src}") format("woff2")`,
    `url("${TitleExtraboldWoffSrc}") format("woff")`
  ].join(', ')
}]);
