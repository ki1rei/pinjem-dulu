import { STATUS_REQUEST_PJ } from '../../lib/constants.js';
import { mockOrganisasi } from './organisasi.js';
import { mockUsers } from './users.js';

export const mockRequestPj = [
  {
    id: 'req-pj-1',
    pemohon: mockUsers[0],
    organisasi: mockOrganisasi[0],
    status: STATUS_REQUEST_PJ.MENUNGGU,
    alasan: 'Ingin membantu pengelolaan inventaris BEM FT.',
  },
];
