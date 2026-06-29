class InteractiveWhiteboard {
    // Custom SVG Cursors encoded as data URIs
    static CURSORS = {
        // Pencil cursor: tip at bottom-left (hotspot 2,30)
        pen: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cg transform='rotate(-45 16 16)'%3E%3Crect x='13' y='4' width='6' height='18' rx='1' fill='%23f5c518' stroke='%23333' stroke-width='1'/%3E%3Cpolygon points='13,22 19,22 16,28' fill='%23f5c518' stroke='%23333' stroke-width='1'/%3E%3Cpolygon points='14,28 18,28 16,32' fill='%23222'/%3E%3Crect x='13' y='4' width='6' height='4' rx='1' fill='%23888' stroke='%23333' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E") 2 30, crosshair`,
        // Eraser cursor: a square eraser shape
        eraser: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Crect x='2' y='10' width='24' height='14' rx='2' fill='%23ffb3b3' stroke='%23c0392b' stroke-width='1.5'/%3E%3Crect x='2' y='10' width='10' height='14' rx='2' fill='%23ff7675' stroke='%23c0392b' stroke-width='1.5'/%3E%3C/svg%3E") 2 24, cell`,
        // Text cursor
        text: 'text',
        // Default
        default: 'default'
    };

    constructor(containerId, canvasId, options = {}) {
        this.container = document.getElementById(containerId);
        this.canvasId = canvasId;
        this.canvasElement = document.getElementById(canvasId);
        
        // Setup Fabric Canvas
        this.canvas = new fabric.Canvas(canvasId, {
            isDrawingMode: true,
            backgroundColor: '#ffffff',
            selection: true,
            freeDrawingCursor: InteractiveWhiteboard.CURSORS.pen
        });

        // Resize handling
        this.resizeCanvas();
        
        const parent = this.container.querySelector('.whiteboard-canvas-container');
        if (parent && window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                if (parent.clientWidth > 0) {
                    this.resizeCanvas();
                }
            });
            resizeObserver.observe(parent);
        }
        window.addEventListener('resize', () => this.resizeCanvas());

        // State for Undo/Redo
        this.history = [];
        this.historyStep = -1;
        this.isHistoryProcessing = false;

        // Default Brush Settings
        this.currentColor = '#1A1A1A';
        this.currentBrushWidth = 5;
        this.canvas.freeDrawingBrush.color = this.currentColor;
        this.canvas.freeDrawingBrush.width = this.currentBrushWidth;

        this.setupToolbar();
        this.setupHistoryListeners();
        this.saveHistory(); // Initial state

        // Apply initial pencil cursor
        this.applyPenCursor();
    }

    resizeCanvas() {
        const parent = this.container.querySelector('.whiteboard-canvas-container');
        if (parent && parent.clientWidth > 0) {
            this.canvas.setWidth(parent.clientWidth);
            this.canvas.setHeight(parent.clientHeight || 400); // Default height if 0
            this.canvas.renderAll();
        }
    }

    setupToolbar() {
        // Controls
        const penBtn = this.container.querySelector('.wb-pen-btn');
        const textBtn = this.container.querySelector('.wb-text-btn');
        const eraserBtn = this.container.querySelector('.wb-eraser-btn');
        const undoBtn = this.container.querySelector('.wb-undo-btn');
        const redoBtn = this.container.querySelector('.wb-redo-btn');
        const clearBtn = this.container.querySelector('.wb-clear-btn');
        const colorPicker = this.container.querySelector('.wb-color-picker');
        
        const setActiveBtn = (activeBtn) => {
            [penBtn, textBtn, eraserBtn].forEach(btn => {
                if(btn) btn.classList.remove('ring-2', 'ring-primary', 'bg-gold/20');
            });
            if(activeBtn) activeBtn.classList.add('ring-2', 'ring-primary', 'bg-gold/20');
        };

        if (penBtn) {
            penBtn.addEventListener('click', () => {
                this.canvas.isDrawingMode = true;
                this.canvas.freeDrawingBrush.color = this.currentColor;
                this.canvas.freeDrawingBrush.width = this.currentBrushWidth;
                this.applyPenCursor();
                setActiveBtn(penBtn);
            });
        }

        if (textBtn) {
            textBtn.addEventListener('click', () => {
                this.canvas.isDrawingMode = false;
                this.canvas.defaultCursor = InteractiveWhiteboard.CURSORS.text;
                this.canvas.hoverCursor = InteractiveWhiteboard.CURSORS.text;
                this.canvas.setCursor(InteractiveWhiteboard.CURSORS.text);
                const text = new fabric.IText('Ketik disini...', {
                    left: this.canvas.width / 2,
                    top: this.canvas.height / 2,
                    fontFamily: 'Grandstander',
                    fill: this.currentColor,
                    fontSize: 24,
                    originX: 'center',
                    originY: 'center'
                });
                this.canvas.add(text);
                this.canvas.setActiveObject(text);
                text.enterEditing();
                text.selectAll();
                setActiveBtn(textBtn);
            });
        }

        if (eraserBtn) {
            eraserBtn.addEventListener('click', () => {
                this.canvas.isDrawingMode = true;
                // Simple eraser by drawing white with thicker brush
                this.canvas.freeDrawingBrush.color = '#ffffff';
                this.canvas.freeDrawingBrush.width = this.currentBrushWidth * 4;
                this.canvas.freeDrawingCursor = InteractiveWhiteboard.CURSORS.eraser;
                this.canvas.setCursor(InteractiveWhiteboard.CURSORS.eraser);
                setActiveBtn(eraserBtn);
            });
        }

        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                this.currentColor = e.target.value;
                if (this.canvas.isDrawingMode && this.canvas.freeDrawingBrush.color !== '#ffffff') {
                    this.canvas.freeDrawingBrush.color = this.currentColor;
                }
                const activeObject = this.canvas.getActiveObject();
                if (activeObject && activeObject.type === 'i-text') {
                    activeObject.set('fill', this.currentColor);
                    this.canvas.renderAll();
                    this.saveHistory();
                }
            });
        }

        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undo());
        }

        if (redoBtn) {
            redoBtn.addEventListener('click', () => this.redo());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if(confirm("Apakah Anda yakin ingin menghapus seluruh gambar?")) {
                    this.canvas.clear();
                    this.canvas.backgroundColor = '#ffffff';
                    this.canvas.renderAll();
                    this.saveHistory();
                }
            });
        }
        
        // Handle delete key for selected objects
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                // Prevent deleting if typing inside an input/textarea or IText is actively being edited
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                const activeObject = this.canvas.getActiveObject();
                if (activeObject) {
                    if (activeObject.isEditing) return; // Don't delete object if editing text
                    this.canvas.remove(activeObject);
                    this.canvas.discardActiveObject();
                    this.saveHistory();
                }
            }
        });

        // Initialize active state
        setActiveBtn(penBtn);
    }

    setupHistoryListeners() {
        this.canvas.on('object:added', () => this.saveHistory());
        this.canvas.on('object:modified', () => this.saveHistory());
        this.canvas.on('object:removed', () => this.saveHistory());
    }

    applyPenCursor() {
        const penCursor = InteractiveWhiteboard.CURSORS.pen;
        this.canvas.freeDrawingCursor = penCursor;
        // Also directly set it on the lower canvas element for immediate effect
        const lowerCanvas = this.container.querySelector('.lower-canvas');
        if (lowerCanvas) {
            lowerCanvas.style.cursor = penCursor;
        }
        this.canvas.renderAll();
    }

    saveHistory() {
        if (this.isHistoryProcessing) return;
        
        // Remove future history if we made a new action after undo
        if (this.historyStep < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyStep + 1);
        }

        this.history.push(JSON.stringify(this.canvas));
        this.historyStep++;
    }

    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.loadHistory(this.history[this.historyStep]);
        }
    }

    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.loadHistory(this.history[this.historyStep]);
        }
    }

    loadHistory(json) {
        this.isHistoryProcessing = true;
        this.canvas.loadFromJSON(json, () => {
            this.canvas.renderAll();
            this.isHistoryProcessing = false;
        });
    }

    // Helper to extract base64 directly
    getBase64Image() {
        // Only return if there is actually something drawn (optional check)
        // For now, always return base64
        return this.canvas.toDataURL({
            format: 'jpeg',
            quality: 0.8
        });
    }
    
    // Check if whiteboard is empty (only background)
    isEmpty() {
        return this.canvas.getObjects().length === 0;
    }
}
