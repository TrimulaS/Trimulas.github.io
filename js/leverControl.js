/**
 *     leverContrast.addListener((valueNew, valueOld) => {
 *
 *    });
 * 
 *      constructor()
 *          init();
 *              draw();
 *          setValue()
 *              #setAngle
 *  
 * 
 * 
 *          #onMouseWheel(e)
 *              #setAngle(e
 *                  #setValueInternal(
 *                      notifyListeners();
 *                          listener()
 *                      draw()
 * 
 * 
 *      #onMouseDown(e)
 *           #onMouseMove(e)
 *              #setAngle(
 *                  #setValueInternal(
 *                      notifyListeners();
 *                          listener()
 *                      draw()
 *          #onMouseUp() {
 */


class LeverControl {
    static #scrollDelta = 2;   // in degrees
    static #counter = 0;
    #id = -1;
    progressPadding = 1;
    
    #value = 0.0; // Initial value from 0.0 to 1.0
    #valueOld = 0.0; // Initial value from 0.0 to 1.0
    #angle = Math.PI; // initial angle (in radians)
    #onMouseMoveHandler;
    #onMouseUpHandler;
    #onMouseLeaveHandler;

 


    // Приватный метод для обработки нажатия мыши
    #onMouseDown(e) {
        const { x0, y0, lineLength, circleRadius } = this;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const endX = x0 + lineLength * Math.cos(this.#angle);
        const endY = y0 - lineLength * Math.sin(this.#angle);

        const distance = Math.sqrt((mouseX - endX) ** 2 + (mouseY - endY) ** 2);
        if (distance <= circleRadius) {
            this.dragging = true;

            document.addEventListener('mousemove', this.#onMouseMoveHandler);
            document.addEventListener('mouseup', this.#onMouseUpHandler); // отслеживание на уровне документа
            document.addEventListener('mouseleave', this.#onMouseLeaveHandler);
        }
    }

    // Приватный метод для обработки перемещения мыши
    #onMouseMove(e) {
        if (this.dragging) {
            const { x0, y0 } = this;
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const dx = mouseX - x0;
            const dy = y0 - mouseY;

            this.#setAngle(Math.atan2(dy, dx));
        }
    }

    // Обработка колеса мыши
    #onMouseWheel(e) {
        e.preventDefault();
        const angleChange = (LeverControl.#scrollDelta * Math.PI) / 180;
        this.#setAngle(e.deltaY > 0 ? this.#angle - angleChange : this.#angle + angleChange);
    }

    // Приватный метод для завершения перемещения
    #onMouseUp() {
        document.removeEventListener('mousemove', this.#onMouseMoveHandler);
        document.removeEventListener('mouseup', this.#onMouseUpHandler);
        document.removeEventListener('mouseleave', this.#onMouseLeaveHandler);
        this.dragging = false;
    }
    #onMouseLeave(){
    
    }

    setOnProgresDraw(callback){
        this._onProgressDraw = callback;
        // re-draw after progress bar render changed
        this.draw();
    }

    
    
    constructor (container, value = -1, title = "", progressColor = "", size = 150) {
        this.title = title;

        this.progressColor = progressColor;
        this.size = size;
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size / 1.5;
        this.ctx = this.canvas.getContext('2d');

        this.textStyle = "normal 16px Arial";
        this.textStyleTitle = "bold 16px Arial";
        this.ctx.font = this.textStyle;

        // Handle
        this.lineLength = this.size / 2.5;
        this.circleRadius = this.size / 15;    // handle circle
        this.x0 = this.size / 2;
        this.y0 = this.size / 2;
        this.dragging = false;
        this.listeners = [];
        this.isListenerOn = false;

        // Привязанные функции сохраняем сразу, чтобы избежать повторного `bind`
        this.#onMouseMoveHandler  = this.#onMouseMove.bind(this);
        this.#onMouseUpHandler    = this.#onMouseUp.bind(this);
        this.#onMouseLeaveHandler = this.#onMouseLeave.bind(this);

        LeverControl.#counter++;
        this.#id = LeverControl.#counter;

        // Progress draw
        this.setOnProgresDraw( (ctx, value, padding )=>{
            const width = ctx.canvas.width;
            const height = ctx.canvas.height;
            //draw progress inside if color defined
            if(this.progressColor!=""){
                ctx.fillStyle = this.progressColor;
                // Расчет высоты прямоугольника
                const heightProgress = height * value;
                const p = padding; 
                ctx.fillRect(0 + p, height - heightProgress + p, width - 2*p, heightProgress - 2*p);
            }

        });

        this.init();
        if(value==-1){
            this.#value = 0;
            this.#valueOld = -1;
        } else{
            this.setValue(value);
        }


        
    }
    // Инициализация события
    init() {
        this.container.appendChild(this.canvas);
        this.draw();

        this.canvas.addEventListener('mousedown', this.#onMouseDown.bind(this));
        this.canvas.addEventListener('wheel', this.#onMouseWheel.bind(this));
    }

    // Добавление слушателей
    addListener(listener) {
        if (typeof listener === 'function') {
            this.listeners.push(listener);
        }

    }

    // Уведомление слушателей
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.#value, this.#valueOld));
    }

    // Приватный метод для установки угла
    #setAngle(angle) {
        if(0 <= angle && angle <= Math.PI) {
            this.#angle = angle
            }
            else if(-Math.PI/2 < angle && angle < 0  ) {
                this.#angle = 0;
            }
            else 
                this.#angle = Math.PI;
        this.#setValueInternal(1 - this.#angle / Math.PI);

    }

    // Приватный метод для обновления значения
    #setValueInternal(newValue) {
        if (this.#value !== newValue) {
            this.#valueOld = this.#value;
            this.#value = newValue;
            if(this.isListenerOn){
                this.notifyListeners();
            }
            else{
                this.isListenerOn = true;
            }
            this.draw();
        }
    }

    // Публичный метод для установки значения
    setValue(newValue) {
        this.#setAngle( (1 - newValue) * Math.PI );
    }
    //Assign valuew  avoiding ping pong 
    setValueBypassingListener(newValue){
        this.isListenerOn = false;
        this.setValue(newValue);
    }

    // Получение значения
    getValue() {
        return this.#value;
    }

    // Рендеринг элемента управления
    draw() {
        const { ctx, x0, y0, lineLength, circleRadius, size, canvas, left } = this;

        const endX = x0 + lineLength * Math.cos(this.#angle);
        const endY = y0 - lineLength * Math.sin(this.#angle);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // //draw progress inside if color defined
        // if(this.progressColor!=""){
        //     ctx.fillStyle = this.progressColor;
        //     // Расчет высоты прямоугольника
        //     const height = canvas.height * this.#value;
        //     const p = this.#progressPadding
        //     ctx.fillRect(0 + p, canvas.height - height + p, size - 2*p, height - 2*p);
        // }

        this._onProgressDraw(ctx, this.#value, this.#valueOld, this.progressPadding);

        // Линия
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Малый круг в верхней точке линии
        ctx.beginPath();
        ctx.arc(endX, endY, circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'orange';
        ctx.fill();
        ctx.stroke();

        // Центральный круг (axis)
        ctx.beginPath();
        ctx.arc(x0, y0, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.stroke();

        // Textes: Title and procent of progress
        //const rect = this.canvas.getBoundingClientRect();
        const percentage = Math.round(100 - (this.#angle / Math.PI) * 100);

        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';

        ctx.strokeStyle = 'white';  // Цвет обводки
        ctx.lineWidth = 3;          // Толщина обводки

        if(this.title != "") {                               //If no title - than procent will be as title 
            ctx.font = this.textStyleTitle;
            ctx.strokeText(`${this.title}` , x0, y0 / 2 - 18);
            ctx.fillText(`${this.title}` , x0, y0 / 2 - 18);

            ctx.font = this.textStyle;
            ctx.strokeText(`${percentage}%`, x0, y0 / 2 + 16 / 2);
            ctx.fillText(`${percentage}%`, x0, y0 / 2 + 16 / 2);
        }
        else {
            ctx.strokeText(`${percentage}%`, x0, y0 / 2 - 18);
            ctx.fillText(`${percentage}%`, x0, y0 / 2 - 18);

            ctx.strokeText(`val = ${Math.round(this.#value * 10000) / 10000}`, x0, y0 / 2 + 16 / 2);
            ctx.fillText(`val = ${Math.round(this.#value * 10000) / 10000}`, x0, y0 / 2 + 16 / 2);
            
        }



        
        
        
    }
}
