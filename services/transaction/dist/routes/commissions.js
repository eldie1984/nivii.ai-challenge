"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commissionRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.commissionRoutes = router;
// Get commission rates
router.get('/rates', async (req, res) => {
    res.json({
        success: true,
        data: {
            broker_commission: 0.001, // 0.1%
            exchange_commission: 0.0005, // 0.05%
            transaction_tariff: 0.001 // 0.1%
        }
    });
});
//# sourceMappingURL=commissions.js.map