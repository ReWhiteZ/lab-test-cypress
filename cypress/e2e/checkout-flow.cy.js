// Helper: แปลง "$29.99" -> 29.99
function parsePrice(text) {
  return parseFloat(text.replace('$', '').trim());
}

describe('SauceDemo - 5 Requirements', { testIsolation: false }, () => {
  // ตัวแปร shared ระหว่าง test (เพราะ testIsolation: false ทำให้ state ต่อเนื่อง)
  let maxPrice;
  let minPrice;

  before(() => {
    cy.visit('/');
    cy.get('[data-test="username"]').type('standard_user');
    cy.get('[data-test="password"]').type('secret_sauce');
    cy.get('[data-test="login-button"]').click();
    cy.url().should('include', '/inventory.html');
  });

  it('Req 1: Sorting - Price high to low', () => {
    // เปลี่ยน sort
    cy.get('[data-test="product-sort-container"]').select('hilo');

    // ดึงราคาทั้งหมด → ตรวจว่าเรียงจากมากไปน้อย
    cy.get('[data-test="inventory-item-price"]').then(($prices) => {
      const prices = [...$prices].map((el) => parsePrice(el.textContent));

      expect(prices.length).to.be.at.least(2);

      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).to.be.gte(prices[i + 1]);
      }

      // เก็บไว้ใช้ใน Req 2
      maxPrice = prices[0];
      minPrice = prices[prices.length - 1];
    });
  });
  
  it('Req 2: Multi-Item Selection - most & least expensive', () => {
    // หลัง sort hilo: ชิ้นแรก = แพงสุด, ชิ้นสุดท้าย = ถูกสุด
    cy.get('[data-test="inventory-item"]').first().within(() => {
      cy.get('[data-test="inventory-item-price"]')
        .invoke('text')
        .then((text) => {
          const price = parsePrice(text);
          expect(price).to.equal(maxPrice); // cross-check กับ Req 1
        });
      cy.contains('button', 'Add to cart').click();
    });

    cy.get('[data-test="inventory-item"]').last().within(() => {
      cy.get('[data-test="inventory-item-price"]')
        .invoke('text')
        .then((text) => {
          const price = parsePrice(text);
          expect(price).to.equal(minPrice);
        });
      cy.contains('button', 'Add to cart').click();
    });

    // Badge ตะกร้า = 2
    cy.get('[data-test="shopping-cart-badge"]').should('have.text', '2');
  });

  it('Req 3: Cart Navigation - 2 items match selection', () => {
    cy.get('[data-test="shopping-cart-link"]').click();
    cy.url().should('include', '/cart.html');

    cy.get('[data-test="inventory-item-price"]').then(($prices) => {
      expect($prices).to.have.length(2);

      const cartPrices = [...$prices]
        .map((el) => parsePrice(el.textContent))
        .sort((a, b) => a - b);

      const expected = [minPrice, maxPrice].sort((a, b) => a - b);

      cartPrices.forEach((actual, i) => {
        expect(actual).to.be.closeTo(expected[i], 0.01);
      });
    });
  });

  it('Req 4: Checkout & Calculation', () => {
    // --- ไปหน้า checkout ---
    cy.get('[data-test="checkout"]').click();
    cy.url().should('include', '/checkout-step-one.html');

    // --- กรอกข้อมูลผู้ซื้อ ---
    cy.get('[data-test="firstName"]').type('Test');
    cy.get('[data-test="lastName"]').type('User');
    cy.get('[data-test="postalCode"]').type('10110');
    cy.get('[data-test="continue"]').click();
    cy.url().should('include', '/checkout-step-two.html');

    // --- ตรวจ Item Total / Tax / Total ---
    cy.get('[data-test="subtotal-label"]').invoke('text').then((subtotalText) => {
      cy.get('[data-test="tax-label"]').invoke('text').then((taxText) => {
        cy.get('[data-test="total-label"]').invoke('text').then((totalText) => {
          // Helper ดึงเงินจาก "Label: $XX.XX"
          const extractMoney = (t) => parseFloat(t.split('$').pop().trim());

          const subtotal = extractMoney(subtotalText);
          const tax = extractMoney(taxText);
          const total = extractMoney(totalText);

          // 1) Item Total = sum(2 ชิ้น)
          const expectedSubtotal = maxPrice + minPrice;
          expect(subtotal).to.be.closeTo(expectedSubtotal, 0.01);

          // 2) Tax ≈ 8% ของ subtotal (tolerance 0.02 เผื่อ rounding)
          const expectedTax = subtotal * 0.08;
          expect(tax).to.be.closeTo(expectedTax, 0.02);

          // 3) Total = subtotal + tax
          expect(total).to.be.closeTo(subtotal + tax, 0.01);
        });
      });
    });
  });

  it('Req 5: Complete - URL & Thank you message', () => {
    cy.get('[data-test="finish"]').click();

    cy.url().should('eq', 'https://www.saucedemo.com/checkout-complete.html');

    cy.get('[data-test="complete-header"]')
      .should('have.text', 'Thank you for your order!');
  });
});