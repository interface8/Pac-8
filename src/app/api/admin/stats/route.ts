import { requireApiAuth, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

// GET /api/admin/stats — dashboard overview statistics
export async function GET() {
  const guard = await requireApiAuth();
  if (isErrorResponse(guard)) return guard;

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      revenueResult,
      thisMonthRevenue,
      lastMonthRevenue,
      thisMonthOrders,
      lastMonthOrders,
      ordersByStatus,
      paymentsByStatus,
      recentOrders,
      topProducts,
      activeProducts,
      pendingOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.category.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: "PAID", createdAt: { gte: startOfMonth } },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: "PAID", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.order.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.order.groupBy({ by: ["paymentStatus"], _count: { id: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.orderItem.groupBy({
        by: ["productName"],
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { totalPrice: "desc" } },
        take: 5,
      }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

    // Low stock products
    const allTracked = await prisma.product.findMany({
      where: { trackQuantity: true, status: "ACTIVE" },
      select: { id: true, name: true, sku: true, quantity: true, lowStockThreshold: true },
    });
    const lowStockProducts = allTracked
      .filter((p) => p.quantity <= p.lowStockThreshold)
      .slice(0, 10);

    const totalRevenue = revenueResult._sum.totalAmount ? Number(revenueResult._sum.totalAmount) : 0;
    const thisMonthRev = thisMonthRevenue._sum.totalAmount ? Number(thisMonthRevenue._sum.totalAmount) : 0;
    const lastMonthRev = lastMonthRevenue._sum.totalAmount ? Number(lastMonthRevenue._sum.totalAmount) : 0;
    const revenueGrowth = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : 0;
    const ordersGrowth = lastMonthOrders > 0 ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0;

    const statusCounts: Record<string, number> = {};
    for (const item of ordersByStatus) statusCounts[item.status] = item._count.id;

    const paymentCounts: Record<string, number> = {};
    for (const item of paymentsByStatus) paymentCounts[item.paymentStatus] = item._count.id;

    return jsonResponse({
      data: {
        totalUsers,
        totalProducts,
        activeProducts,
        totalOrders,
        totalCategories,
        totalRevenue,
        thisMonthRevenue: thisMonthRev,
        lastMonthRevenue: lastMonthRev,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        thisMonthOrders,
        ordersGrowth: Math.round(ordersGrowth * 10) / 10,
        pendingOrders,
        ordersByStatus: statusCounts,
        paymentsByStatus: paymentCounts,
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          status: o.status,
          paymentStatus: o.paymentStatus,
          totalAmount: Number(o.totalAmount),
          itemCount: o.items.length,
          createdAt: o.createdAt,
        })),
        lowStockProducts,
        topProducts: topProducts.map((p) => ({
          name: p.productName,
          totalSold: p._sum.quantity ?? 0,
          totalRevenue: p._sum.totalPrice ? Number(p._sum.totalPrice) : 0,
        })),
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch stats";
    return errorResponse(message, 500);
  }
}
