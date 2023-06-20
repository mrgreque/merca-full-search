import puppeteer, { Page } from 'puppeteer';
import { ZipCodeValidation } from './zipcode-validation';
import fs from 'fs';

async function clickButton(page: Page, selector: string) {
  return await Promise.all([page.waitForNavigation(), page.click(selector)]);
}

(async () => {
  const search = 'furadeira';

  const zipcode = '14061130';
  const zipcodevalidation = new ZipCodeValidation();

  const isValid = await zipcodevalidation.validate(zipcode);

  console.log(isValid);

  if (isValid) {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: false,
    });
    const page = await browser.newPage();

    await page.goto(
      'https://www.mercadolivre.com.br/navigation/addresses-hub?go=https%3A%2F%2Fwww.mercadolivre.com.br%2F',
    );

    await page.setViewport({ width: 1080, height: 1024 });

    const cepInput = await page.$('.andes-form-control__message');
    await cepInput?.type(zipcode, { delay: 150 });

    await page.click('.andes-form-control__control > div > button');

    await page.waitForNavigation();

    const searchInput = await page.waitForXPath('//form[@class="nav-search"]/input');
    await searchInput?.type(search, { delay: 100 });

    await clickButton(page, '.nav-search > button');

    //await page.click('.nav-search > button');

    try {
      await page.waitForSelector('#shipping_highlighted_fulfillment', {
        timeout: 1000,
      });
      await page.click('#shipping_highlighted_fulfillment');

      console.log('Clicou no botão de frete grátis');
    } catch (error) {
      console.log('Não foi possível clicar no botão de frete grátis');
    }

    try {
      // métodoo que só obtem os links
      // const links = await page.$$eval('.ui-search-result__image > a', (item) => {
      //   console.log(item);
      //   return item.map((result) => {
      //     console.log(result);
      //     return {
      //       href: result.getAttribute('href'),
      //       text: result.innerHTML,
      //     };
      //   });
      // });

      console.log('Aguardando a página de resultados');

      let linkstest;

      linkstest = await page.$x('//ol[@class="ui-search-layout ui-search-layout--stack shops__layout"]');

      console.log('LINK 1');
      console.log(linkstest.length);

      if (linkstest.length === 0) {
        console.log('segundo tipo de ol');
        linkstest = await page.$x('//ol[@class="ui-search-layout ui-search-layout--grid"]');

        console.log('LINK 2');
        console.log(linkstest.length);
      }

      if (linkstest.length === 0) {
        console.log('ERROOOOOOOOOOOOOOOOOO');
      }

      const items = await Promise.all(
        linkstest.map(async (link, index) => {
          const titleDiv = await link.$$('.ui-search-result__wrapper');
          const items = await Promise.all(
            titleDiv?.map(async (item) => {
              const internalTitle = await item.$eval('.ui-search-item__title', (item) => {
                return item.textContent;
              });

              const internalPrice = await item.$eval(
                '.shops__items-group-details > .ui-search-price > .ui-search-price__second-line > span.price-tag > span.price-tag-text-sr-only',
                (item) => {
                  return item.textContent;
                },
              );

              const link = await item.$eval('.shops__items-group > a', (item) => {
                return item.getAttribute('href');
              });

              const imageSrc = await item.$eval(
                // '.ui-search-result__image > a > div > div > div > div > div > img',
                '.ui-search-result__image > section > div > div > div > div > a > img',
                (item) => {
                  return item.getAttribute('src');
                },
              );

              const imageDataSrc = await item.$eval(
                // '.ui-search-result__image > a > div > div > div > div > div > img',
                '.ui-search-result__image > section > div > div > div > div > a > img',
                (item) => {
                  return item.getAttribute('data-src');
                },
              );

              // const image2 = await item.$eval(
              //   // '.ui-search-result__image > a > div > div > div > div > div > img',
              //   '.ui-search-result__image > section > div > div > div > div > a > img',
              //   (item) => {
              //     return item.outerHTML.split('data-src="')[1].split('"')[0];
              //   },
              // );

              return {
                title: internalTitle ? internalTitle : 'Sem título',
                price: internalPrice ? internalPrice : '0 reais',
                link: link ? link : 'Sem link',
                imageSrc: imageSrc ? imageSrc : 'Sem imagem',
                imageDataSrc: imageDataSrc ? imageDataSrc : 'Sem imagem',
              };
            }),
          );

          // return items.sort((a, b) => {
          //   const priceA = a.price;
          //   const priceB = b.price;

          //   return parseInt(priceA) - parseInt(priceB);
          // });
          return items;
        }),
      );

      try {
        const atualPage = await page.$eval('.andes-pagination__link', (item) => {
          return item.textContent;
        });

        const totalPage = await page.$eval('.andes-pagination__page-count', (item) => {
          return item.textContent;
        });

        console.log(`Paginação: ${atualPage} de ${totalPage?.split(' ')[1]}`);
      } catch (error) {
        console.log('Não foi possível pegar a paginação');
      }

      console.log(JSON.stringify(items[0]));
      console.log(items[0][0].imageDataSrc);
      console.log(items[0][0].imageSrc);
      await page.goto(items[0][5].imageDataSrc);
    } catch (error) {
      console.log(error);
    }
  }

  //await browser.close();
})();
