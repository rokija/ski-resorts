const axios = require("axios");
const cheerio = require("cheerio");

// TODO: get all countries
// fetch('https://restcountries.com/v3.1/all')
//   .then(response => response.json())
//   .then(data => {
//     const countries = data.map(country => country.name.common);
//     console.log(countries); // Prints an array of country names
//   });

const europeanCountries = [
  "Albania",
  "Andorra",
  "Armenia",
  "Austria",
  "Azerbaijan",
  "Belarus",
  "Belgium",
  "Bosnia and Herzegovina",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Greece",
  "Hungary",
  "Iceland",
  "Ireland",
  "Italy",
  "Kazakhstan",
  "Kosovo",
  "Latvia",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Moldova",
  "Monaco",
  "Montenegro",
  "Netherlands",
  "North Macedonia",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "Russia",
  "San Marino",
  "Serbia",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Switzerland",
  "Turkey",
  "Ukraine",
  "United Kingdom",
  "Vatican City",
];

export async function GET(request: Request) {
  async function fetchResortDetails(url: string) {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const lat = $("span.latitude").attr("title");
      const lng = $("span.longitude").attr("title").replace("° W", "").trim();

      let officialWebsite = "N/A";

      $("li.resort-guide-travel__item").each((i: any, element: any) => {
        if ($(element).find("b").text().trim() === "Tourist Office Website") {
          officialWebsite = $(element).find("a").attr("href");
          return false;
        }
      });

      return { lat, lng, officialWebsite };
    } catch (error) {
      console.error("Error fetching resort details:", error);
      return { lat: "N/A", lng: "N/A", officialWebsite: "N/A" };
    }
  }

  async function fetchSkiResorts(country: string) {
    const countryUrl =
      country.split(" ").length > 1 ? country.split(" ").join("-") : country;

    try {
      const promises = [];
      const tabs = [];
      const url = `https://www.snow-forecast.com/countries/${countryUrl}/resorts`;

      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      tabs.push(""); // initial tab

      $("#ctry_tabs a").each((i: any, element: any) => {
        const href = $(element).attr("href");
        let tabValue;
        if (href) {
          // Extracting the end part of the href
          const parts = href.split("/");
          tabValue = parts[parts.length - 1];
        } else {
          // Fallback to text if href is not present
          tabValue = $(element).text().trim();
        }

        if (
          !tabValue.includes("powder") &&
          !tabValue.includes("piste") &&
          !tabValue.includes("Best")
        ) {
          tabs.push(tabValue);
        }
      });

      for (const tab of tabs) {
        const url = `https://www.snow-forecast.com/countries/${countryUrl}/resorts/${tab}`;

        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const getOnPisteText = (element: any) => {
          const onPisteTd = $(element).find("td.on-piste");
          if (onPisteTd.find("a").length) {
            return onPisteTd.find("a").text().trim();
          } else if (onPisteTd.find("span.secondary").length) {
            return onPisteTd.find("span.secondary").text().trim();
          }
          return "N/A";
        };

        const resortPromises = $("tr.digest-row")
          .map(async (i: any, element: any) => {
            const onPisteText = getOnPisteText(element);

            const resortLink = $(element).find("td.name a").first();
            const resortName = resortLink.text().trim();
            const homepage =
              "https://www.snow-forecast.com" + resortLink.attr("href");

            const { lat, lng, officialWebsite } = await fetchResortDetails(
              homepage
            );

            return {
              name: resortName,
              lat: Number(lat),
              lng: Number(lng),
              homepage: officialWebsite,
              piste: onPisteText,
            };
          })
          .get();

        promises.push(...resortPromises);
      }
      return Promise.all(promises);
    } catch (error) {
      console.error("Error fetching ski resorts:", error);
      return [];
    }
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function fetchAllCountries() {
    const resorts = [];

    for (const country of europeanCountries) {
      const resort = await fetchSkiResorts(country);
      resorts.push({ country, resorts: resort });
      await delay(1000);
    }

    return resorts;
  }

  const res = await fetchAllCountries().then((skiResorts) => {
    return skiResorts;
  });

  return Response.json(res);
}
