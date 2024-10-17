// -----------------------------------------------------------------------------
// References to Document Elements
// -----------------------------------------------------------------------------

// Welcome Overlay
const welcomePanel = document.getElementById("welcomePanel");
const buttonOpen = document.getElementById("buttonOpen");
const buttonOpenWithExample = document.getElementById("buttonOpenWithExample");

// Editor
const editorInput = document.getElementById("editorInput");
const input = document.getElementById("input");
const output = document.getElementById("output");

// General Buttons
const buttonNew = document.getElementById("buttonNew");
const buttonPrint = document.getElementById("buttonPrint");
const inputFileNameToSaveAs = document.getElementById("inputFileNameToSaveAs");
const buttonSaveAsFile = document.getElementById("buttonSaveAsFile");
const buttonSaveInCache = document.getElementById("buttonSaveInCache");

// Input Buttons
const buttonInsertMain = document.getElementById("buttonInsert__Main");
const buttonInsertCondition = document.getElementById("buttonInsert__Condition");
const buttonInsertSwitch = document.getElementById("buttonInsert__Switch");
const buttonInsertLoop = document.getElementById("buttonInsert__Loop");
const buttonInsertParagraph = document.getElementById("buttonInsert__Paragraph");
const buttonInsertModule = document.getElementById("buttonInsert__Module");
const buttonDarkTheme = document.getElementById("buttonDarkTheme");// Output Tool Buttons

// Output Buttons
const buttonReload = document.getElementById("buttonReload");
const buttonLiveReload = document.getElementById("buttonLiveReload");
const buttonExtendedFormatting = document.getElementById("buttonExtendedFormatting");

// -----------------------------------------------------------------------------
// Global Variables
// -----------------------------------------------------------------------------

const parser = new PseudoCodeParser({
    delimiters: [
        { pattern: /\bperform\b/i, replacement: "╔══ perform", border: "║" },
        { pattern: /\bendperform\b/i, replacement: "╙──", border: false },
    ],
    extendedExpressions: [
        { pattern: /\b(perform|varying|from|by)\b/ig, replacement: '<span class="reserved-word">$1</span>' },
        { pattern: /\b__print-pb__\b/ig, replacement: '<span class="print-pb"></span>' }
    ]
});
let useExtendedFormatting = true;
let liveReload = true;
let inputValue = input.value;
let darkTheme = true;

// -----------------------------------------------------------------------------
// Definition of Listeners
// -----------------------------------------------------------------------------

// Window
window.addEventListener("load", function() {
    putCacheContentToInput();

    if (input.value !== "") {
        welcomePanel.style.display = "none";
    }

    drawDiagram();
});

// Load Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/da/serviceWorkerOffline.js', { scope: '/da/' }).catch(function(err) {
        // registration failed :(
        console.error('ServiceWorker registration failed: ', err);
        });
    });
}

window.addEventListener("beforeunload", function() {
    saveContentToCache();
});

// Document
document.addEventListener("keydown", function(event) {
    if (isSaveKeyboardShortcut(event)) {
        event.preventDefault();

        saveContentToCache();
    }
});

// Welcome Overlay
buttonOpen.addEventListener("click", function(event) {
    event.preventDefault();
    welcomePanel.style.display = "none";
    input.focus();
});

buttonOpenWithExample.addEventListener("click", function(event) {
    event.preventDefault();
    welcomePanel.style.display = "none";
    input.value = "// Exemple\n\n// On souhaite ajouter, dans un tableau, des personnes identifiées par leurs noms\n// et prénoms. Ensuite, on souhaite afficher à l'écran le contenu du tableau.\n\n---* Exemple de diagramme\nnbPers = 0\nObtenir nomPrénom\n\ndo while (nomPrénom != \"ZZZ\")\n   module(AjoutPersonne;tabPersonnes, nbPersonnes, nomPrénom;tabPersonnes, nbPersonnes)\n   Obtenir nomPrénom\nenddo\nparagraphe(Sorties)\n------\n\n---* AjoutPersonne\niPers = 0\ndo while (iPers < nbPers AND tabPers[iPers] != nomPrénom)\n   iPers++\nenddo\nif (iPers = nbPers)\n   tabPers[iPers] = nomPrénom\nelse\n   Sortir nomPrénom, \" déjà présent dans le tableau.\"\nendif\n------\n\n---* Sorties\niPers = 0\ndo while (iPers < nbPers)\n   Sortir tabPers[iPers]\n   iPers++\nenddo\n------";
    input.focus();
    drawDiagram();
});

// Input
input.addEventListener("keyup", function() {
    if (liveReload && inputValue !== input.value) {
        inputValue = input.value;
        drawDiagram();
    }
});

input.addEventListener("keydown", function (event) {
    if (event.shiftKey && event.key ==="Tab") {
        event.preventDefault();

        manageTabulation(-2);
        return;
    }

    // Tabulation
    if (event.key === "Tab") {
        event.preventDefault();

        manageTabulation(2);
    }

    // Parenthesis
    if (event.key === '(' || event.key === '[' || event.key === '{' || event.key === '"' || event.key === "'") {
        const start = this.selectionStart;
        const end = this.selectionEnd;

        if (start === end) {
            return;
        }
        event.preventDefault();

        const selectedText = this.value.substring(start, end);

        const open = event.key;
        const close = (event.key === '(') ? ')' : (event.key === '[') ? ']' : (event.key === '{') ? '}' : event.key;

        // Set textarea value to: text before selection + open + selected text + close + text after selection
        this.value = this.value.substring(0, start) + open + selectedText + close + this.value.substring(end);

        // Put caret at right position again
        this.selectionStart = start + 1;
        this.selectionEnd = end + 1;
    }
});

function manageTabulation(spaceNumber) {
    const start = input.selectionStart;
    const end = input.selectionEnd;

    // Expand selection to the start and end of the lines
    const startLine = input.value.lastIndexOf("\n", start - 1) + 1;
    const endLine = input.value.indexOf("\n", end);
    const adjustedEnd = endLine === -1 ? input.value.length : endLine;

    const selectedText = input.value.substring(startLine, adjustedEnd);
    const lines = selectedText.split("\n");

    for (let i = 0; i < lines.length; i++) {
        if (spaceNumber > 0) {
            lines[i] = " ".repeat(spaceNumber) + lines[i];
        } else {
            const regex = new RegExp(`^ {0,${-spaceNumber}}`);
            lines[i] = lines[i].replace(regex, "");
        }
    }

    const newText = lines.join("\n");

    input.value = input.value.substring(0, startLine) + newText + input.value.substring(adjustedEnd);

    input.selectionStart = start;
    input.selectionEnd = start + newText.length;
}

input.addEventListener("scroll", function () {
    const ratio = input.scrollTop / (input.scrollHeight - input.clientHeight);
    output.scrollTop = ratio * (output.scrollHeight - output.clientHeight);
    output.scrollLeft = input.scrollLeft;
});

// output.addEventListener("scroll", function () {
//     const ratio = output.scrollTop / (output.scrollHeight - output.clientHeight);
//     input.scrollTop = ratio * (input.scrollHeight - input.clientHeight);
//     input.scrollLeft = output.scrollLeft;
// });

// General Buttons
buttonNew.addEventListener("click", function(event){
    event.preventDefault();
    localStorage["codeDA"] = "";
    input.value = "";
    output.innerHTML = "";
});

buttonSaveInCache.addEventListener("click", function(event){
    event.preventDefault();
    saveContentToCache();
});

buttonPrint.addEventListener("click", function(event) {
    event.preventDefault();
    window.print();
});

buttonSaveAsFile.addEventListener("click", function(event){
    event.preventDefault();

    const fileName = inputFileNameToSaveAs.value;

    if (fileName) {
        saveTextAsFile(fileName);
        toastr.success("L'export a bien été créé.", "Export réussi");
    } else {
        toastr.error("Veuillez spécifier un nom pour le fichier à exporter.", "Erreur");
    }
});

// Input Buttons
buttonInsertMain.addEventListener("click", function(event) {
    event.preventDefault();
    insert(input, "---*\n\n------");
    drawDiagram();
});

buttonInsertCondition.addEventListener("click", function(event) {
    event.preventDefault();
    insert(input, "if ()\n\nelse\n\nendif");
    drawDiagram();
});

buttonInsertSwitch.addEventListener("click", function(event) {
    event.preventDefault();
    insert(input, "switch ()\n\ncase ()\n\ndefault\n\nendswitch");
    drawDiagram();
});

buttonInsertLoop.addEventListener("click", function(event) {
    event.preventDefault();
    insert(input, "while ()\n\nendwhile");
    drawDiagram();
});

buttonInsertModule.addEventListener("click", function(event) {
    event.preventDefault();
    insert(input, "module(MonModule;;)");
    drawDiagram();
});

buttonInsertParagraph.addEventListener("click", function(event) {
    event.preventDefault();
    insert(input, "paragraphe(MonParagraphe)");
    drawDiagram();
});

buttonDarkTheme.addEventListener("click", function(event) {
    event.preventDefault();
    if (darkTheme) {
        editorInput.classList.remove("editor--dark");
        buttonDarkTheme.classList.remove("option-item--active");
    } else {
        editorInput.classList.add("editor--dark");
        buttonDarkTheme.classList.add("option-item--active");
    }
    darkTheme = !darkTheme;
});

// Output Buttons
buttonReload.addEventListener("click", function(event) {
    event.preventDefault();
    if (!liveReload) {
        drawDiagram();
    }
});

buttonLiveReload.addEventListener("click", function(event) {
    event.preventDefault();
    if (liveReload) {
        buttonLiveReload.classList.remove("option-item--active");
        buttonReload.classList.remove("option-item--disabled");
    } else {
        buttonLiveReload.classList.add("option-item--active");
        buttonReload.classList.add("option-item--disabled");
    }
    liveReload = !liveReload;
    drawDiagram();
});

buttonExtendedFormatting.addEventListener("click", function(event) {
    event.preventDefault();
    if (useExtendedFormatting) {
        buttonExtendedFormatting.classList.remove("option-item--active");
    } else {
        buttonExtendedFormatting.classList.add("option-item--active");
    }
    useExtendedFormatting = !useExtendedFormatting;
    drawDiagram();
});

// -----------------------------------------------------------------------------
// Functions
// -----------------------------------------------------------------------------

function drawDiagram() {
    output.innerHTML = parser.getFormattedDiagram(input.value, useExtendedFormatting);
}

function insert(input, string) {
    const position = input.selectionStart;
    const before = input.value.substring(0, position);
    const after = input.value.substring(position, input.value.length);

    input.value = before + string + after;
    input.selectionStart = position + string.length;
    input.selectionEnd = input.selectionStart;
    input.focus();
}

function saveTextAsFile(fileName) {
    const source = input.value.replace(/\n/g, "\r\n");
    const fileUrl = window.URL.createObjectURL(new Blob([source], {type:"text/plain"}));
    const downloadLink = createDownloadLink(fileUrl, fileName);

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function createDownloadLink(href, name) {
    const downloadLink = document.createElement("a");
    downloadLink.download = name;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = href;
    downloadLink.style.display = "none";
    return downloadLink;
}

function saveContentToCache(){
    localStorage['codeDA'] = document.getElementById('input').value;
    toastr.success("DA enregistré dans le cache du navigateur.","Sauvegardé !");
}

function putCacheContentToInput(){
    document.getElementById("input").value = localStorage['codeDA'] || '';
}

function isSaveKeyboardShortcut(event) {
    const userAgent = window.navigator.userAgent;

    let os = "unknown";

    if (userAgent.indexOf("Win") !== -1) os = "Windows";
    if (userAgent.indexOf("Mac") !== -1) os = "Mac";
    if (userAgent.indexOf("Linux") !== -1) os = "Linux";
    if (userAgent.indexOf("X11") !== -1) os = "Android";

    return (os === "Mac" ? event.metaKey : event.ctrlKey) && event.keyCode === 83;
}
