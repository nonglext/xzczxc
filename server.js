const express = require(express);
const axios = require(axios);
const app = express();
const PORT = process.env.PORT  3000;

app.get(check, async (req, res) = {
     Получаем реальный IP игрока
    const ip = req.headers[x-forwarded-for].split(,)[0].trim()
              req.headers[cf-connecting-ip]
              req.socket.remoteAddress;

    console.log(`[CHECK] IP ${ip}`);

    try {
         Запрос 1 — ip-api (ISP, город, ВПН)
        const ipRes = await axios.get(
            `httpip-api.comjson${ip}fields=status,country,countryCode,isp,org,proxy,hosting,city,regionName,as`
        );
        const ipData = ipRes.data  {};

         Запрос 2 — proxycheck.io (точная проверка ВПН)
        let proxyData = {};
        try {
            const proxyRes = await axios.get(
                `httpsproxycheck.iov2${ip}vpn=1&asn=1&risk=1&node=1`,
                { timeout 3000 }
            );
            proxyData = proxyRes.data[ip]  {};
        } catch (e) {
            console.log([proxycheck] Ошибка, e.message);
        }

         Определяем ВПН по двум источникам
        const isVPN = proxyData.proxy === yes
                    proxyData.type === VPN
                    proxyData.type === TOR
                    proxyData.type === SOCKS
                    ipData.proxy === true
                    ipData.hosting === true;

        const vpnType = proxyData.type  (ipData.proxy  Proxy  (ipData.hosting  Hosting  Нет));
        const risk    = proxyData.risk  0;

        const result = {
            success true,
            ip          ip,
            isVPN       isVPN,
            vpnType     vpnType,
            risk        risk,
            isp         ipData.isp   proxyData.provider  Неизвестно,
            org         ipData.org   Неизвестно,
            as          ipData.as    Неизвестно,
            country     ipData.country      Неизвестно,
            countryCode ipData.countryCode  XX,
            city        ipData.city         Неизвестно,
            region      ipData.regionName   Неизвестно
        };

        console.log(`[RESULT] ${JSON.stringify(result)}`);
        res.json(result);

    } catch (err) {
        console.error([ERROR], err.message);
        res.json({
            success false,
            ip      ip,
            isVPN   false,
            isp     Ошибка проверки,
            error   err.message
        });
    }
});

 Проверка что сервер живой
app.get(ping, (req, res) = {
    res.json({ status ok });
});

app.listen(PORT, () = {
    console.log(`Server started on port ${PORT}`);
});