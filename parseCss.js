// 简单 CSS 解析函数，返回 {selector: {prop: value, ...}, ...}
function parseCSS(cssText) {
  const rules = {};
  const ruleRegex = /([^{]+)\{([^}]+)\}/g;
  let match;
  while ((match = ruleRegex.exec(cssText)) !== null) {
    const selector = match[1].trim();
    const declarationsText = match[2].trim();
    const declarations = {};
    declarationsText.split(";").forEach((decl) => {
      const [property, value] = decl.split(":");
      if (property && value) {
        declarations[property.trim()] = value.trim();
      }
    });
    rules[selector] = declarations;
  }
  return rules;
}

// 解析行内 style 字符串，例如 "height: 100px; color: red;"
function parseInlineStyle(inlineStyle) {
  const styleObj = {};
  if (!inlineStyle) return styleObj;
  inlineStyle.split(";").forEach((decl) => {
    const [property, value] = decl.split(":");
    if (property && value) {
      styleObj[property.trim()] = value.trim();
    }
  });
  return styleObj;
}

// 主函数：提取 style 标签样式，并合并到节点 style 属性中
function extractAndParseStylesFromTree(root) {
  const styleSheet = {};

  // 1. 找到 style 标签，解析 CSS 并合并进 styleSheet
  function findAndParseStyle(node) {
    if (node.nodeName === "style") {
      const styleTextNode = node.children.find((c) => c.nodeName === "#text");
      if (styleTextNode && styleTextNode.content) {
        Object.assign(styleSheet, parseCSS(styleTextNode.content));
      }
    }
    if (node.children) {
      node.children.forEach(findAndParseStyle);
    }
  }
  findAndParseStyle(root);

  // 2. 遍历节点，合并样式
  function applyStyles(node) {
    if (!node.attributes) node.attributes = [];

    // 转成 map 方便取值
    const attrsMap = {};
    node.attributes.forEach(({ name, value }) => {
      attrsMap[name] = value;
    });

    let combinedStyle = {};

    // 根据 class 选择器合并样式
    if (attrsMap.class) {
      // 支持多 class，以空格分隔
      const classes = attrsMap.class.split(/\s+/);
      classes.forEach((cls) => {
        const classSelector = "." + cls;
        if (styleSheet[classSelector]) {
          Object.assign(combinedStyle, styleSheet[classSelector]);
        }
      });
    }

    // 根据 id 选择器合并样式
    if (attrsMap.id) {
      const idSelector = "#" + attrsMap.id;
      if (styleSheet[idSelector]) {
        Object.assign(combinedStyle, styleSheet[idSelector]);
      }
    }

    // 合并行内 style 属性，覆盖掉外部样式
    if (attrsMap.style) {
      Object.assign(combinedStyle, parseInlineStyle(attrsMap.style));
    }

    if (Object.keys(combinedStyle).length > 0) {
      node.style = combinedStyle;
    }

    // 递归处理子节点
    if (node.children) {
      node.children.forEach(applyStyles);
    }
  }
  applyStyles(root);

  return root;
}

module.exports = {
  extractAndParseStylesFromTree,
};
