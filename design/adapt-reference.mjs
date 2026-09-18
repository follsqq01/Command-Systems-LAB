// One-time adapter: split the measured Figma reference into semantic React
// sections and compile its layout values into ordinary, self-contained CSS.
// Runtime code has no dependency on Figma or Tailwind.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';

const traverse = traverseModule.default;
const generate = generateModule.default;
const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'design/reference.tsx'), 'utf8');
const tree = parse(source, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
const assetManifest = JSON.parse(fs.readFileSync(path.join(root, 'design/assets.json'), 'utf8'));
const images = new Map(assetManifest.map(a => [a.name, a.file]));
const sections = [
  ['279:1483', 'Hero', 'home', 'Лаборатория командных систем'],
  ['277:843', 'Atmosphere', 'atmosphere', 'Форум и сообщество'],
  ['277:853', 'Changes', 'changes', 'Что сейчас меняется в командах'],
  ['279:1552', 'FormatMap', 'format-map', 'Четыре формата'],
  ['277:1034', 'Program', 'program', 'Программа — 27 октября'],
  ['279:1677', 'Formats', 'formats', 'Форматы участия'],
  ['277:889', 'Invitation', 'invitation', 'Принять участие'],
  ['282:1777', 'Speakers', 'speakers', 'Спикеры и эксперты'],
  ['277:894', 'Gallery', 'gallery', 'Как это было'],
  ['279:1567', 'Tickets', 'tickets', 'Билеты'],
  ['277:868', 'Benefits', 'benefits', 'Почему стоит участвовать'],
];
const sectionMap = new Map(sections.map(s => [s[0], s]));
const links = new Map([
  ['279:1491', 'tickets'], ['277:892', 'tickets'],
  ['279:1493', 'application'], ['279:1574', 'booking'], ['279:1579', 'booking'],
  ['279:1529', 'phone'], ['279:1526', 'program'],
  ['279:1527', 'formats'], ['279:1528', 'speakers'],
]);
const headings = new Map([
  ['279:1485', 'h1'], ['277:1036', 'h2'], ['277:895', 'h2'],
  ['277:870', 'h2'], ['282:1726', 'h2'],
  ['282:1799', 'h3'], ['282:1787', 'h3'], ['282:1793', 'h3'], ['282:1805', 'h3'],
  ['282:1730', 'h3'], ['282:1739', 'h3'], ['282:1743', 'h3'], ['282:1755', 'h3'],
]);
const alt = new Map([
  ['imgEventAtmosphere', 'Участники форума в зале'],
  ['imgOmegaEvents', 'Omega Events'], ['imgGroup2147210894', 'Металогика'],
  ['imgLook0296Resized1', 'Участники обсуждают идеи на форуме'],
  ['imgLook1442Resized1', 'Живое общение на форуме'],
  ['imgLook1442Resized2', 'Команда участников форума'],
  ['img202609091647341', 'Участники в конференц-зале'],
  ['img202609091648331', 'Выступление спикера на сцене'],
  ['img202609091641051', 'Спикер с микрофоном'],
  ['img202609101456231', 'Кофе и угощения для участников'],
  ['imgE08B7221E6324F5D8B78Ecbf90588F30Photoroom1', 'Александр Сычев'],
  ['img1Photoroom1', 'Диана Гладких'], ['imgPhotoroom1', 'Роман Адушкин'],
  ['imgD9F3CecdC9Ae4A118C734Df6Aaf1Bdb6Photoroom1', 'Екатерина Крайванова'],
]);
const css = [];
let anonymousLayout = 0;
const attr = (node, name) => node.openingElement.attributes.find(a => a.type === 'JSXAttribute' && a.name.name === name);
const addAttr = (node, name, value) => node.openingElement.attributes.push(t.jsxAttribute(t.jsxIdentifier(name), t.stringLiteral(value)));
const rename = (node, name) => {
  node.openingElement.name = t.jsxIdentifier(name);
  if (node.closingElement) node.closingElement.name = t.jsxIdentifier(name);
};
traverse(tree, {
  JSXElement(p) {
    const node = p.node;
    let nodeId = attr(node, 'data-node-id')?.value.value;
    const classAttr = attr(node, 'className');
    if (!nodeId && classAttr) {
      nodeId = `layout-${++anonymousLayout}`;
      addAttr(node, 'data-node-id', nodeId);
    }
    if (classAttr && nodeId !== '277:836') {
      let classes = classAttr.value.value
        .replaceAll("font-['Helvetica:Regular']", "font-['Forum_Helvetica']")
        .replaceAll("font-['Helvetica:Light']", "font-['Forum_Helvetica'] font-light")
        .replaceAll("font-['Albert_Sans:Regular']", "font-['Forum_Albert_Sans','Forum_Helvetica',sans-serif]");
      css.push(`[data-node-id="${nodeId}"] { @apply ${classes}; }`);
      node.openingElement.attributes = node.openingElement.attributes.filter(a => a !== classAttr);
    }
    if (headings.has(nodeId)) rename(node, headings.get(nodeId));
    if (['277:854', '279:1568', '277:1029', '277:891'].includes(nodeId)) {
      addAttr(node, 'role', 'heading');
      node.openingElement.attributes.push(t.jsxAttribute(t.jsxIdentifier('aria-level'), t.jsxExpressionContainer(t.numericLiteral(2))));
    }
    if (sectionMap.has(nodeId)) {
      const [, , id, label] = sectionMap.get(nodeId);
      rename(node, nodeId === '279:1483' ? 'header' : 'section');
      addAttr(node, 'id', id); addAttr(node, 'aria-label', label);
    }
    if (nodeId === '279:1525') { rename(node, 'nav'); addAttr(node, 'aria-label', 'Разделы сайта'); }
    if (links.has(nodeId)) {
      rename(node, 'ActionLink');
      addAttr(node, 'destination', links.get(nodeId));
    }
    const src = attr(node, 'src');
    if (node.openingElement.name.name === 'img' && src?.value.type === 'JSXExpressionContainer') {
      const key = src.value.expression.name;
      src.value.expression = t.callExpression(t.identifier('asset'), [t.stringLiteral(images.get(key))]);
      attr(node, 'alt').value = t.stringLiteral(alt.get(key) ?? '');
      addAttr(node, 'decoding', 'async');
    }
  },
});

fs.mkdirSync(path.join(root, 'src/sections'), { recursive: true });
const returned = tree.program.body.find(n => n.type === 'ExportDefaultDeclaration').declaration.body.body.find(n => n.type === 'ReturnStatement').argument;
for (const [nodeId, name] of sections) {
  const node = returned.children.find(n => n.type === 'JSXElement' && attr(n, 'data-node-id')?.value.value === nodeId);
  const result = generate(node, { comments: false, jsescOption: { minimal: true } }).code;
  const imports = [result.includes('asset(') && "import { asset } from '../assets';", result.includes('<ActionLink') && "import { ActionLink } from '../ActionLink';"].filter(Boolean).join('\n');
  fs.writeFileSync(path.join(root, `src/sections/${name}.tsx`), `${imports}\n\nexport function ${name}() {\n  return (${result});\n}\n`);
}
const compiled = await postcss([tailwind({ optimize: false })]).process('@import "tailwindcss" source(none);\n' + css.join('\n'), { from: path.join(root, 'src/design.input.css') });
fs.writeFileSync(path.join(root, 'src/design.css'), compiled.css);
console.log(`Created ${sections.length} sections and ${css.length} measured CSS rules.`);
