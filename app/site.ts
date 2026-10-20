// Keep these values together when moving the portfolio to another repository.
export const BASE_PATH = '/abdul-mannan-portfolio/';
export const SITE_URL = 'https://abdul-mannan-061.github.io' + BASE_PATH;
export const CMS_URL = 'https://app.pagescms.org/Abdul-Mannan-061/abdul-mannan-portfolio/main/file/portfolio';

export function isLocalMediaPath(value: string): boolean {
  return value.startsWith('/media/') &&
    value.slice(7).split('/').every(part => part !== '' && part !== '.' && part !== '..') &&
    !/[\\?#\u0000-\u001f]/.test(value);
}

// CMS stores portable /media/... paths. GitHub project sites need the repository prefix.
export function mediaUrl(value: string): string {
  return isLocalMediaPath(value)
    ? BASE_PATH + value.slice(1).split('/').map(encodeURIComponent).join('/')
    : value;
}
