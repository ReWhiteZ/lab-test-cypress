# Lab 06 — Cypress กับ JavaScript

คู่มือเริ่มโปรเจกต์ Cypress สำหรับ end-to-end browser test ตั้งแต่สร้างโปรเจกต์ Node.js และอธิบายพื้นฐานการเขียน spec ด้วย Cypress โดยไม่ยึดกับโจทย์เฉพาะ

## สิ่งที่ต้องมี

- Node.js เวอร์ชันที่รองรับโดย Cypress (แนะนำ LTS ปัจจุบัน)
- npm ซึ่งติดตั้งมาพร้อม Node.js
- ระบบปฏิบัติการและ browser ที่ Cypress รองรับ

ตรวจสอบด้วย `node --version` และ `npm --version`

## สร้างโปรเจกต์จากศูนย์

```cmd
mkdir cypress-e2e-tests
cd /d cypress-e2e-tests
npm init -y
npm install cypress
```

ตรวจ Cypress และสร้างโฟลเดอร์สำหรับ spec:

```cmd
npx cypress --version
mkdir cypress
mkdir cypress\e2e
```

จากนั้นสร้าง `cypress.config.js` และไฟล์ `cypress/e2e/example.cy.js` ด้วยตนเองตามตัวอย่างด้านล่าง

ตัวอย่าง spec:

```javascript
describe('Example page', () => {
  it('shows the expected heading', () => {
    cy.visit('https://example.com');
    cy.get('h1').should('have.text', 'Example Domain');
  });
});
```

## โครงสร้างโปรเจกต์ตัวอย่าง

```text
cypress-e2e-tests/
├── cypress/
│   ├── e2e/                 # ไฟล์ spec ลงท้าย .cy.js
│   ├── fixtures/            # ข้อมูลตัวอย่างที่ spec โหลดใช้
│   └── support/             # custom commands และ setup ที่ใช้ร่วมกัน
├── cypress.config.js
├── package.json
└── package-lock.json
```

`cypress.config.js` ใช้ตั้งค่าเช่น `baseUrl`, viewport และพฤติกรรมตอนทดสอบ ส่วน `package-lock.json` บันทึก dependency versions และควร commit ทั้งสองไฟล์

## หลักการเขียน Cypress test

- ใช้ `describe()` จัดกลุ่ม spec และ `it()` ระบุพฤติกรรมที่ทดสอบ
- `cy.visit()` เปิดหน้า และ `cy.get()`/`cy.contains()` หา element
- ต่อ action เช่น `.click()`, `.type()` และ `.select()` เข้ากับ command chain
- Cypress retry คำสั่ง query และ assertion ตาม timeout โดยอัตโนมัติ จึงหลีกเลี่ยง `cy.wait(คงที่)` เมื่อรอ element ได้
- ใช้ `.should()` หรือ Chai `expect()` ตรวจผล เช่น ข้อความ, URL หรือจำนวน element
- command ภายใน `cy.get(...).then(...)` เหมาะกับการอ่านค่าจาก DOM และคำนวณต่อ คำสั่ง Cypress ควรรันผ่าน command chain
- ย้ายขั้นตอนซ้ำไป custom command ใน `cypress/support/commands.js` เมื่อเหมาะสม

## ติดตั้งและรันโปรเจกต์นี้

ติดตั้ง dependencies จาก lockfile และรัน Cypress:

```cmd
npm ci
npx cypress open
npx cypress run
```

`npm ci` ใช้ติดตั้งตาม `package-lock.json`; `cypress open` เปิด GUI ให้เลือก browser/spec; `cypress run` รันแบบ headless จาก command line

ในโปรเจกต์นี้ `baseUrl` ตั้งเป็น `https://www.saucedemo.com` แล้ว จึงใช้ `cy.visit('/')` ใน spec ได้ หากจะทดสอบระบบอื่น เปลี่ยน `baseUrl` ใน `cypress.config.js`

## แนวทางที่ควรทำ

- แยก spec ตาม feature หรือพฤติกรรมที่ตรวจ
- ใช้ selector ที่เสถียร เช่น `data-test` แทน class สำหรับตกแต่งหน้า
- หลีกเลี่ยงการพึ่ง state ที่เหลือจาก spec อื่น เพื่อให้แต่ละ test ทำซ้ำได้
- เก็บข้อมูลทดสอบไว้ใน fixture หรือ configuration ตามความเหมาะสม และอย่า commit secret จริง

## เปิดดูระหว่างสอบ: ทางลัดและภาพรวมไฟล์นี้

โครงสร้างคือ `describe()` จัดกลุ่ม, `it()` ระบุกรณี, `cy.visit()` เปิดหน้า, `cy.get()`/`cy.contains()` หา element, action เช่น `.click()`/`.type()` และ assertion เช่น `.should()`. `baseUrl` ใน config ช่วยให้ `cy.visit('/')` สั้นลง

ไฟล์ทดสอบปัจจุบัน:

| ไฟล์ | สิ่งที่แสดงให้ดู |
|---|---|
| `smoke.cy.js` | เปิดหน้า, login และตรวจ URL กับ heading |
| `checkout-flow.cy.js` | แสดงการ sort, อ่านราคา, ตรวจ cart, กรอก checkout และตรวจผลรวม/ข้อความจบ |

ข้อควรจำ: `checkout-flow.cy.js` ตั้ง `testIsolation: false` และใช้ `before()` เตรียม session ร่วมกันระหว่าง test จึงอาศัยลำดับ/state ที่แชร์อยู่ หากเขียน test ใหม่สำหรับงานอื่น ให้เริ่มจาก test ที่ทำงานอิสระและทำซ้ำได้ โดยค่าเริ่มต้น Cypress เปิด isolation ให้แต่ละ test

### คำสั่งที่ใช้บ่อย

```cmd
npm ci
npx cypress open       # เลือก browser และ spec ผ่านหน้าต่าง Cypress
npx cypress run        # รันทุก spec จาก command line
npx cypress run --spec "cypress/e2e/smoke.cy.js"
```

### เมื่อเจอปัญหา

- `cy.visit('/')` เปิดผิด host: ตรวจ `baseUrl` ใน `cypress.config.js`
- query หา element ไม่เจอ: ตรวจ selector และให้ Cypress retry ผ่าน `.should()` แทน fixed wait
- state จาก test ก่อนหน้ามีผล: เปิด test isolation หรือเตรียม state ใหม่ในแต่ละ `it()`
- รันจาก command line แล้วหา browser ไม่เจอ: ตรวจ browser ที่ Cypress รองรับและลอง `npx cypress open` เพื่อเลือก browser ที่ติดตั้งไว้

### เอกสารอ้างอิงขณะสอบ

- [Cypress: Writing and organizing tests](https://docs.cypress.io/app/core-concepts/writing-and-organizing-tests)
- [Cypress: Your first end-to-end test](https://docs.cypress.io/app/end-to-end-testing/writing-your-first-end-to-end-test)
- [Cypress: Assertions](https://docs.cypress.io/app/references/assertions)
- [Cypress: Configuration](https://docs.cypress.io/app/references/configuration)

