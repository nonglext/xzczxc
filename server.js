const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/check", async (req, res) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim()
             || req.headers["cf-connecting-ip"]
             || req.socket.remoteAddress;

    console.log("[CHECK] IP: " + ip);

    try {
        const ipRes = await axios.get(
            "http://ip-api.com/json/" + ip + "?fields=status,country,countryCode,isp,org,proxy,hosting,city,regionName,as"
        );
        const ipData = ipRes.data || {};

        let proxyData = {};
        try {
            const proxyRes = await axios.get(
                "https://proxycheck.io/v2/" + ip + "?vpn=1&asn=1&risk=1",
                { timeout: 3000 }
            );
            proxyData = proxyRes.data[ip] || {};
        } catch (e) {
            console.log("[proxycheck] Ошибка: " + e.message);
        }

        const isVPN = proxyData.proxy === "yes"
                   || proxyData.type === "VPN"
                   || proxyData.type === "TOR"
                   || proxyData.type === "SOCKS"
                   || ipData.proxy === true
                   || ipData.hosting === true;

        const result = {
            success:     true,
            ip:          ip,
            isVPN:       isVPN,
            vpnType:     proxyData.type || (ipData.proxy ? "Proxy" : (ipData.hosting ? "Hosting" : "Нет")),
            risk:        proxyData.risk || 0,
            isp:         ipData.isp || proxyData.provider || "Неизвестно",
            org:         ipData.org || "Неизвестно",
            country:     ipData.country || "Неизвестно",
            countryCode: ipData.countryCode || "XX",
            city:        ipData.city || "Неизвестно",
            region:      ipData.regionName || "Неизвестно"
        };

        console.log("[RESULT] " + JSON.stringify(result));
        res.json(result);
    } catch (err) {
        console.error("[ERROR] " + err.message);
        res.json({ success: false, ip: ip, isVPN: false, isp: "Ошибка", error: err.message });
    }
});

app.get("/ping", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log("Server started on port " + PORT);
});
