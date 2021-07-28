// -----------------------------------------------------------------------------
// References to Document Elements
// -----------------------------------------------------------------------------

// Welcome Overlay
var welcomePanel = document.getElementById("welcomePanel");
var buttonOpen = document.getElementById("buttonOpen");
var buttonOpenWithExample = document.getElementById("buttonOpenWithExample");

// Editor
var editorInput = document.getElementById("editorInput");
var input = document.getElementById("input");
var output = document.getElementById("output");

// General Buttons
var buttonNew = document.getElementById("buttonNew");
var buttonPrint = document.getElementById("buttonPrint");
var inputFileNameToSaveAs = document.getElementById("inputFileNameToSaveAs");
var buttonSaveAsFile = document.getElementById("buttonSaveAsFile");
var buttonSaveInCache = document.getElementById("buttonSaveInCache");

// Input Buttons
var buttonInsertMain = document.getElementById("buttonInsert__Main");
var buttonInsertCondition = document.getElementById("buttonInsert__Condition");
var buttonInsertSwitch = document.getElementById("buttonInsert__Switch");
var buttonInsertLoop = document.getElementById("buttonInsert__Loop");
var buttonInsertParagraph = document.getElementById("buttonInsert__Paragraph");
var buttonInsertModule = document.getElementById("buttonInsert__Module");
var buttonExtendedFormatting = document.getElementById("buttonExtendedFormatting");
var buttonDarkTheme = document.getElementById("buttonDarkTheme");// Output Tool Buttons

// Output Buttons
var buttonReload = document.getElementById("buttonReload");
var buttonLiveReload = document.getElementById("buttonLiveReload");
var buttonExtendedFormatting = document.getElementById("buttonExtendedFormatting");

// -----------------------------------------------------------------------------
// Global Variables
// -----------------------------------------------------------------------------

var parser = new PseudoCodeParser({
    delimiters: [
        { pattern: /\bperform\b/i, replacement: "╔══ perform", border: "║" },
        { pattern: /\bendperform\b/i, replacement: "╙──", border: false },
    ],
    extendedExpressions: [
        { pattern: /\b(perform|varying|from|by)\b/ig, replacement: '<span class="reserved-word">$1</span>' },
        { pattern: /\b__print-pb__\b/ig, replacement: '<span class="print-pb"></span>' }
    ]
});
var useExtendedFormatting = true;
var liveReload = true;
var inputValue = input.value;
var darkTheme = true;

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

input.addEventListener("keypress", function (event) {
    // Tabulation
    if (event.keyCode === 9) {
        event.preventDefault();
        var cursor = input.selectionStart;
        insert(input, "  ");
        input.selectionStart = cursor + 2;
        input.selectionEnd = input.selectionStart;
    }
});

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

    var fileName = inputFileNameToSaveAs.value;

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
    insert(input, "if ()\n\nelseif ()\n\nelseif ()\n\nelse\n\nendif");
    drawDiagram();
});

buttonInsertLoop.addEventListener("click", function(event) {
    event.preventDefault();
    insert(input, "do while ()\n\nenddo");
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
    var position = input.selectionStart;
    var before = input.value.substring(0, position);
    var after = input.value.substring(position, input.value.length);

    input.value = before + string + after;
    input.selectionStart = position + string.length;
    input.selectionEnd = input.selectionStart;
    input.focus();
};

function saveTextAsFile(fileName) {
    var source = input.value.replace(/\n/g, "\r\n");
    var fileUrl = window.URL.createObjectURL(new Blob([source], {type:"text/plain"}));
    var downloadLink = createDownloadLink(fileUrl, fileName);

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function createDownloadLink(href, name) {
    var downloadLink = document.createElement("a");
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
	var codeDA = localStorage['codeDA'] || '';
	document.getElementById("input").value = codeDA;
}

function isSaveKeyboardShortcut(event) {
    return (window.navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey) && event.keyCode == 83;
}