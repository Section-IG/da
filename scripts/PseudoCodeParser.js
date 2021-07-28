var PseudoCodeParser = function(ownValues) {
    this.borders = "";

    this.delimiters = [
        { pattern: /---\*/i,        replacement: "┌─── *",      border: "│" },
        { pattern: /---[-]+/i,      replacement: "└──────────", border: false },
        { pattern: /\bif\b/i,       replacement: "┌── if",      border: "│" },
        { pattern: /\belseif\b/i,   replacement: "├── if",      border: true },
        { pattern: /\belse\b/i,     replacement: "├── else",    border: true },
        { pattern: /\bendif\b/i,    replacement: "└──",         border: false },
        { pattern: /\b___\b/i,      replacement: "└──",         border: false },
        { pattern: /\bdo\b/i,       replacement: "╔══ do",      border: "║" },
        { pattern: /\benddo\b/i,    replacement: "╙──",         border: false },
        { pattern: /===/i,          replacement: "╙──",         border: false }
    ];

    this.symbols = [
        { pattern: /<=/g, replacement: "≤" },
        { pattern: />=/g, replacement: "≥" },
        { pattern: /!=/g, replacement: "≠" },
        { pattern: /<->/g, replacement: "←→" },
        { pattern: /->/g, replacement: "→" },
        { pattern: /=>/g, replacement: "⇒" },
        { pattern: /sqrt\^/g, replacement: "√" },
        { pattern: /&&/g, replacement: "AND" }
    ];

    this.extendedExpressions = [
        { pattern: /"([^"\n]*)"/ig, replacement: '<span class="quote">"$1"</span>' },
        { pattern: /'([^'\n]*)'/ig, replacement: '<span class="quote">\'$1\'</span>' },
        { pattern: /\/\/ (.*)/ig, replacement: '<span class="comment">// $1</span>' },
        { pattern: /\/\*([^*/]*)\*\//ig, replacement: '<span class="comment">/*$1*/</span>' },
        { pattern: /\b(if|else|do|while|until|times|and|or|is|not|than|est|non)\b/ig, replacement: '<span class="reserved-word">$1</span>' },
        { pattern: /\b(true|false|break|stop|vrai|faux|hv|lv|null|nil|equal)\b/ig, replacement: '<span class="reserved-word">$1</span>' },
        { pattern: /\b(obtenir|sortir|libérer|liberer|traiter|get|print|return|free|process)\b/ig, replacement: '<span class="keyword">$1</span>' },
        { pattern: /┌─── \* (.*)/ig, replacement: '┌─── * <span class="diagram-title">$1</span>' },
        { pattern: /\[([^\]]+)\]ent/ig, replacement: '<span class="whole-part">[</span>$1<span class="whole-part">]ENT</span>' }
    ];

    if (ownValues) {
        if (ownValues.delimiters) {
            this.delimiters = this.delimiters.concat(ownValues.delimiters);
        } 
        if (ownValues.symbols) {
            this.symbols = this.symbols.concat(ownValues.symbols);
        }
        if (ownValues.extendedExpressions) {
            this.extendedExpressions = this.extendedExpressions.concat(ownValues.extendedExpressions);
        }
    }
};

PseudoCodeParser.prototype.getFormattedDiagram = function(string, useExtendedFormatting) {
    this.borders = "";

    var diagram = this.normalize(string);
    diagram = this.replaceSymbols(diagram);
    diagram = this.escapeHtml(diagram);
    diagram = this.parseModules(diagram);

    var lines = diagram.split("\n");
    
    for (var i in lines) {
        lines[i] = this.parseBlock(lines[i].trim());
    }

    diagram = lines.join("\n");

    if (useExtendedFormatting) {
        diagram = this.replaceExtendedExpressions(diagram);
    }

    return diagram;
};

PseudoCodeParser.prototype.normalize = function(string) {
    // Remove surrounding whitespaces
    string = string.trim();
    // Standardize line breaks
    string = string.replace(/\r\n|\r/g, "\n");
    // Strip any lines consisting only of spaces
    string = string.replace(/^[ ]+$/m, "");

    return string;
};

PseudoCodeParser.prototype.replaceSymbols = function(string) {
    this.symbols.forEach(function(symbol) {
        string = string.replace(symbol.pattern, symbol.replacement);
    });

    return string;
};

PseudoCodeParser.prototype.replaceExtendedExpressions = function(string) {
    this.extendedExpressions.forEach(function(expression) {
        string = string.replace(expression.pattern, expression.replacement);
    });

    return string;
};

PseudoCodeParser.prototype.escapeHtml = function(string) {
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    };

    return string.replace(/[&<>]/g, function(symbol) {
        return entityMap[symbol];
    });
};

PseudoCodeParser.prototype.parseModules = function(string) {
    string = string.replace(/paragraph[e]?\((.+)\)/ig, (function(match, title) {
        return this.createModule(title, "", "", {
            topLeft:    '┌',    topRight:   '┐',
            bottomLeft: '└',    bottomRight:'┘',
        });
    }).bind(this));

    string = string.replace(/module\(([^;\n]+)[;]?([^;\n]*)[;]?([^\n]*)\)$/igm, (function(match, title, inputs, outputs) {
        inputs = (inputs.trim().length > 0) ? " ↓ " + inputs : "";
        outputs = (outputs.trim().length > 0) ? " ↓ " + outputs : "";

        return this.createModule(title, inputs, outputs, {
            topLeft:    'o',    topRight:   'o',
            bottomLeft: 'o',    bottomRight:'o',
        });
    }).bind(this));

    return string;
};

PseudoCodeParser.prototype.parseBlock = function(string) {
    var matchesFirstWord = string.match(/^[a-z-_\*=]+/i);
    var firstWord = (matchesFirstWord) ? matchesFirstWord[0] : "";

    var delimiter = this.getDelimiterObject(firstWord);

    if (!delimiter) {
        return this.addBorders(string, "", true);
    }

    string = string.replace(delimiter.pattern, delimiter.replacement);
    string = this.addBorders(string, delimiter.border, false);

    return string;        
};

PseudoCodeParser.prototype.createModule = function(title, inputs, outputs, corners) {
    var border = "";

    for (var i = 0; i < title.length; i++) {
        border += "─";
    }

    var moduleBlock = corners.topLeft + "─" + border + "─" + corners.topRight + inputs + "\n";
    moduleBlock += "│ " + title  + " │\n";
    moduleBlock += corners.bottomLeft + "─" + border + "─" + corners.bottomRight + outputs;

    return moduleBlock;
};

PseudoCodeParser.prototype.addBorders = function(string, border, whitespace) {
    var borders = this.borders;

    if (typeof border === "string" && border.length > 0) {
        this.borders += border;
    } else if (typeof border === "boolean") {
        borders = borders.substring(0, borders.length - 1);

        if (!border) {
            this.borders = borders;
        }
    }

    return (whitespace) ? (borders + " " + string) : (borders + string);
};

PseudoCodeParser.prototype.getDelimiterObject = function(string) {
    var i = 0;

    while (i < this.delimiters.length && !string.match(this.delimiters[i].pattern)) {
        i++;
    }

    return (i < this.delimiters.length) ? this.delimiters[i] : null;
};