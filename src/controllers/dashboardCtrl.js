import dashboardService from '../services/dashboardService.js';

/**
 * Controlador de Dashboard
 * Responsabilidad: Manejar peticiones HTTP del panel de administración
 * Principio SOLID: Single Responsibility - Solo maneja requests/responses
 */
const dashboardController = {
  /**
   * GET /api/admin/dashboard
   * Obtiene estadísticas generales del dashboard
   */
  async getStats(req, res) {
    try {
      const stats = await dashboardService.getGeneralStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas del dashboard',
        error: error.message
      });
    }
  },

  /**
   * GET /api/admin/sales-report
   * Obtiene reporte de ventas por período
   */
  async getSalesReport(req, res) {
    try {
      const { period = 'month' } = req.query;
      
      // Validar período
      const validPeriods = ['day', 'week', 'month', 'year'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          message: `Período inválido. Debe ser uno de: ${validPeriods.join(', ')}`
        });
      }

      const report = await dashboardService.getSalesReport(period);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener reporte de ventas',
        error: error.message
      });
    }
  }
};

export default dashboardController;
