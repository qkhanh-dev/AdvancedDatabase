const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.phanGiuong.deleteMany({});
  await prisma.giuongBenh.updateMany({
    data: { TrangThaiGiuong: 'TRONG' },
  });
  console.log('✅ Đã reset toàn bộ giường bệnh về trạng thái TRỐNG phục vụ kiểm thử!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
