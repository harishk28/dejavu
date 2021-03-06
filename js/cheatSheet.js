"use strict";

const HeaderWrapperAttr = {
    1: 'class=""',
    2: 'class="grid-item mw-300"',
    3: 'class="cheat-card-content"',
}
const HeaderChildWrapperAttr = {
    1: 'class="grid"',
    2: 'class="cheat-card"',
    3: 'class="chld-seperators"',
}


const mathRule = {
    // Specify the order in which this rule is to be run
    order: SimpleMarkdown.defaultRules.text.order - 0.2,
    // First we check whether a string matches
    match: function (source) { return /^\$([\s\S]+?)\$(?!\$)/.exec(source); },
    // Then parse this string into a syntax node
    parse: function (capture, parse, state) { return { content: capture[1] }; },
    // Finally transform this syntax node into a an html element:
    // html: function (node, output) { return katex.renderToString(node.content, katexInlineOptions); },
    html: function (node, output) { return MathJax && MathJax.asciimath2svg && MathJax.asciimath2svg(node.content).outerHTML; },
};

const mdRules = SimpleMarkdown.defaultRules;
mdRules["mathRule"] = mathRule;

const rawBuiltParser = SimpleMarkdown.parserFor(mdRules);

const mdParser = function (source) {
    var blockSource = source + "\n\n";
    return rawBuiltParser(blockSource, { inline: false });
};

const htmlOutput = SimpleMarkdown.htmlFor(SimpleMarkdown.ruleOutput(mdRules, 'html'));

Array.prototype.last = function () {
    return this[this.length - 1];
}

function createCheatSheet(String) {
    var syntaxTree = mdParser(String);
    var htmlString = "";
    var headersStack = []

    syntaxTree.forEach((item, idx) => {
        if (item.type == "heading" && item.level < 3) {
            // check wether we its new heirachy start if yes close the old ones
            while (headersStack.length > 0 && item.level <= headersStack.last()) {
                headersStack.pop();
                htmlString += "</div>";
            }
            htmlString += "<div " + HeaderWrapperAttr[item.level] + " >";
            headersStack.push(item.level);
        }

        htmlString += "<div class='ovrflw-x-auto'>" + htmlOutput(item) + "</div>";

        if (item.type == "heading" && item.level < 3) {
            htmlString += "<div " + HeaderChildWrapperAttr[item.level] + " >";
            headersStack.push(item.level);
        }

    })

    return htmlString;
}