export default function getEmployees() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: 'HungPD',
          position: 'Leader Manager',
        },
        {
          id: 2,
          name: 'NguyenNP',
          position: 'Engineer',
        },
        {
          id: 3,
          name: 'PhatNV',
          position: 'Senior Fullstack Engineer',
        },
        {
          id: 4,
          name: 'LongTB',
          position: 'Senior Fullstack Engineer',
        },
        {
          id: 5,
          name: 'MinhHC',
          position: 'Senior Fullstack Engineer',
        },
        {
          id: 6,
          name: 'TanVD',
          position: 'Fullstack Engineer',
        },
        {
          id: 7,
          name: 'AnhTVH',
          position: 'Fullstack Engineer',
        },
        {
          id: 8,
          name: 'TuHA',
          position: 'Fullstack Engineer',
        },
        {
          id: 9,
          name: 'KhanhDT',
          position: 'Fullstack Engineer',
        },
      ]);
    }, 10000);
  });
}
