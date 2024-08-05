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
          position: 'Senior Fullstack Engineer',
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
      ]);
    }, 5000);
  });
}
