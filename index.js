const PORT = process.env.PORT || 3000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { response } = require("express");

const app = express();

const cryptoNews = [
  {
    name: "cointelegraph",
    address: "https://cointelegraph.com/",
    base: "https://cointelegraph.com",
  },
  {
    name: "coindesk",
    address: "https://www.coindesk.com/",
    base: "https://www.coindesk.com",
  },
  {
    name: "coinmarketcap",
    address: "https://coinmarketcap.com/alexandria",
    base: "https://coinmarketcap.com/alexandria",
  },
  {
    name: "yahoo finance",
    address: "https://finance.yahoo.com/topic/crypto/",
    base: "https://finance.yahoo.com/topic/crypto",
  },
];
const keywords = ["crypto", "cryptocoins", "altcoins", "Bitcoin", "BTC"];
const articles = [];

cryptoNews.forEach((item) => {
  axios.get(item.address).then((response) => {
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      const html = response.data;
      const $ = cheerio.load(html);

      $(`a:contains(${keyword})`, html).each(function () {
        const title = $(this).text();
        const url = $(this).attr("href");

        articles.push({
          title,
          url: item.base + url,
          source: item.name,
        });
      });
    }
  });
});

app.get("/", (req, res) => {
  res.json("All about crypto");
});

app.get("/news", (req, res) => {
  const unique = [
    ...new Map(articles.map((article) => [article.url, article])).values(),
  ];
  res.json(unique);
});

app.get("/news/:itemid", (req, res) => {
  const itemid = req.params.itemid;
  console.log(itemid);
  const newsAddress = cryptoNews.filter((news) => news.name == itemid)[0]
    .address;
  const newsBase = cryptoNews.filter((news) => news.name == itemid)[0].base;

  axios
    .get(newsAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificArticle = [];
      for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i];
        const html = response.data;
        const $ = cheerio.load(html);

        $(`a:contains(${keyword})`, html).each(function () {
          const title = $(this).text();
          const url = $(this).attr("href");
          specificArticle.push({
            title,
            url: newsBase + url,
            source: itemid,
          });
        });
      }
      const unique = [
        ...new Map(
          specificArticle.map((article) => [article.url, article])
        ).values(),
      ];
      res.json(unique);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`Port: ${PORT}`));
