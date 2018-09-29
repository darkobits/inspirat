export interface ImageDescriptor {
  /**
   * Image URL.
   */
  href: string;

  /**
   * Image author.
   */
  author: string;

  /**
   * Link for image author.
   */
  authorHref: string;

  /**
   * (Optional) Image location.
   */
  location?: string;
}


const images: Array<ImageDescriptor> = [
  {
    href: 'https://images.unsplash.com/photo-1508550536558-5e8d33eb9a82',
    location: 'Sekinchan, Malaysia',
    author: 'Fauzan Saari',
    authorHref: 'https://unsplash.com/photos/pZXg_ObLOM4'
  },
  {
    href: 'https://images.unsplash.com/reserve/m6rT4MYFQ7CT8j9m2AEC_JakeGivens%20-%20Sunset%20in%20the%20Park.JPG',
    author: 'Jake Givens',
    authorHref: 'https://unsplash.com/photos/ocwmWiNAWGs'
  },
  {
    href: 'https://images.unsplash.com/photo-1470137430626-983a37b8ea46',
    author: 'Jonas Weckschmied',
    authorHref: 'https://unsplash.com/photos/-N_UwPdUs7E'
  },
  {
    href: 'https://images.unsplash.com/photo-1485583739365-e768c38621b5',
    location: 'José Gálvez, Peru',
    author: 'Luis Ángel Cardoza Rojas',
    authorHref: 'https://unsplash.com/photos/U83ee31GQnI'
  },
  {
    href: 'https://images.unsplash.com/photo-1489065094455-c2d576ff27a0',
    location: 'Yangling, Xianyang, China',
    author: 'Chang Qing',
    authorHref: 'https://unsplash.com/photos/8oPubUm97Cc'
  },
  {
    href: 'https://images.unsplash.com/photo-1458441087617-24d758e383f1',
    author: 'Aaron Burden',
    authorHref: 'https://unsplash.com/photos/3TmLV0fLzfU'
  },
  {
    href: 'https://images.unsplash.com/photo-1485778282426-7d501b522bb4',
    author: 'Sylwia Pietruszka',
    authorHref: 'https://unsplash.com/photos/nPCiBaK8WPk'
  },
  {
    href: 'https://images.unsplash.com/photo-1462759353907-b2ea5ebd72e7',
    location: 'Hobbiton Movie Set, Matamata, New Zealand',
    author: 'Andres Iga',
    authorHref: 'https://unsplash.com/photos/7XKkJVw1d8c'
  },
  {
    href: 'https://images.unsplash.com/photo-1472553384749-8596bacb90c5',
    location: 'Monza, Italy',
    author: 'Valentina Locatelli',
    authorHref: 'https://unsplash.com/photos/P8bsrm8KbM0'
  }
];


export default images;
