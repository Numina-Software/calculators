/*
    This file is part of Alpertron Calculators.

    Copyright 2015 Dario Alejandro Alpern

    Alpertron Calculators is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Alpertron Calculators is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Alpertron Calculators.  If not, see <http://www.gnu.org/licenses/>.
*/
/** @define {number} */ const lang = 0;   // Use with Closure compiler.
  const asmjs = typeof(WebAssembly) === "undefined";
  let worker = 0;
  let blob;
  let fileContents = 0;
  let currentInputBox;
  let funcnames;
  let parens;
  if (lang)
  {
    funcnames =
    [
      "Suma,+,Resta,-,Multiplicación,*,División,/,Resto,%,Potencia,^,Resultado anterior,ans,Raíz cuadrada entera,sqrt(,Raíz entera\n\nPrimer argumento: radicando\nSegundo argumento: orden de la raíz,iroot(,Número aleatorio\n\nPrimer argumento: mínimo valor del número aleatorio\nSegundo argumento: máximo valor del número aleatorio,Random(,Valor absoluto,Abs(,Signo,Sign(",
      "Igual,=,Distinto,!=,Mayor,>,Menor o igual,<=,Menor,<,Mayor o igual,>=",
      "Y lógica, AND ,O lógica, OR ,O exclusiva, XOR ,Negación lógica, NOT ,Desplazamiento a la izquierda\n\nOperando izquierdo: valor a desplazar\nOperando derecho: cantidad de bits, SHL ,Desplazamiento a la derecha\n\nOperando izquierdo: valor a desplazar\nOperando derecho: cantidad de bits, SHR ",
      "Máximo común divisor\n\nSe pueden usar uno o más argumentos,GCD(,Mínimo común múltiplo\n\nSe pueden usar uno o más argumentos,LCM(,¿El valor es primo?,IsPrime(",
      "Primo siguiente,N(,Primo anterior,B(,Cantidad de dígitos\n\nPrimer argumento: valor\nSegundo argumento: base,NumDigits(,Suma de dígitos\n\nPrimer argumento: valor\nSegundo argumento: base,SumDigits(,Invertir dígitos\n\nPrimer argumento: valor\nSegundo argumento: base,RevDigits(",
      "Inverso modular\n\nPrimer argumento: valor\nSegundo argumento: módulo,ModInv(,División modular\n\nPrimer argumento: dividendo\nSegundo argumento: divisor\nTercer argumento: módulo,ModDiv(,Exponenciación modular\n\nPrimer argumento: base\nSegundo argumento: exponente\nTercer argumento: módulo,ModPow(,Indicador de Euler,Totient(,Símbolo de Jacobi\n\nPrimer argumento: valor superior\nSegundo argumento: valor inferior,Jacobi(",
      "Factorial,!,Primorial,#,Fibonacci,F(,Lucas,L(,Partición,P("
    ];
    parens = "Paréntesis izquierdo,(,Paréntesis derecho,),";
  }
  else
  {
    funcnames =
    [
      "Sum,+,Subtraction,-,Multiplication,*,Division,/,Remainder,%,Power,^,Last answer,ans,Integer square root,sqrt(,Integer root\n\nFirst argument: radicand\nSecond argument: root order,iroot(,Random number\n\nFirst argument: minimum value for random number\nSecond argument: maximum value for random number,Random(,Absolute value,Abs(,Sign,Sign(",
      "Equal,=,Not equal,!=,Greater,>,Not greater,<=,Less,<,Not less,>=",
      "Logic AND, AND ,Logic OR, OR ,Exclusive OR, XOR ,Logic NOT, NOT ,Shift left\n\nLeft operand: value to shift\nRight operand: number of bits, SHL ,Shift right\n\nLeft operand: value to shift\nRight operand: number of bits, SHR ",
      "Greatest Common Divisor\n\nOne or more arguments can be used,GCD(,Least Common Multiple\n\nOne or more arguments can be used,LCM(,The value is prime?,IsPrime(",
      "Next prime after,N(,Last prime before,B(,Number of digits\n\nFirst argument: value\nSecond argument: base,NumDigits(,Sum of digits\n\nFirst argument: value\nSecond argument: base,SumDigits(,Reverse digits\n\nFirst argument: value\nSecond argument: base,RevDigits(",
      "Modular inverse\n\nFirst argument: value\nSecond argument: modulus,ModInv(,Modular division\n\nFirst argument: dividend\nSecond argument: divisor\nThird argument: modulus,ModDiv(,Modular power\n\nFirst argument: base\nSecond argument: exponent\nThird argument: modulus,ModPow(,Totient,Totient(,Jacobi symbol\n\nFirst argument: upper value\nSecond argument: lower value,Jacobi(",
      "Factorial,!,Primorial,#,Fibonacci,F(,Lucas,L(,Partition,P("
    ];
    parens = "Left parenthesis,(,Right parenthesis,),";
  }

  function get(x)
  {
    return document.getElementById(x);
  }
  function callWorker(param)
  {
    if (!worker)
    {
      if (!blob)
      {
        if (asmjs)
        {    // Asm.js
        blob = new Blob([fileContents],{type: "text/javascript"});
        }
        else
        {    // WebAssembly
          blob = new Blob([get("worker").textContent],{type: "text/javascript"});
        }
      }   
      worker = new Worker(window.URL.createObjectURL(blob));
      worker.onmessage = function(e)
      { // First character of e.data is "1" for intermediate text
        // and it is "2" for end of calculation.
        get("result").innerHTML = e.data.substring(1);
        if (e.data.substring(0, 1) === "2")
        {   // First character passed from web worker is "2".
          get("solve").disabled = false;
          get("stop").disabled = true;
        }
      };
    }
    if (asmjs)
    {      // Asm.js
      worker.postMessage(param);
    }
    else
    {      // WebAssembly.
      worker.postMessage([param, fileContents]);
    }
  }

  function dowork()
  {
    let param;
    let res = get("result");
    let quadrText = get("quad").value.trim();
    let linText = get("lin").value.trim();
    let constText = get("const").value.trim();
    let modText = get("mod").value.trim();
    let digitGroup = get("digits").value.trim();
    get("help").style.display = "none";
    res.style.display = "block";
    let missing = "";
    if (quadrText === "")
    {
      missing = (lang? "coeficiente cuadrático." : "quadratic coefficient.");
    }
    if (linText === "")
    {
      missing = (lang? "coeficiente lineal." : "linear coefficient.");
    }
    if (constText === "")
    {
      missing = (lang? "término independiente." : "constant coefficient.");
    }
    if (modText === "")
    {
      missing = (lang? "módulo." : "modulus.");
    }
    if (missing !== "")
    {
      res.innerHTML = (lang? "Por favor ingrese un número o expresión para el "+missing :
                                 "Please type a number or expression for the "+missing);
      return;
    }
    get("solve").disabled = true;
    get("stop").disabled = false;
    res.innerHTML = (lang? "Resolviendo la ecuación cuadrática..." :
                               "Solving the quadratic equation...");
    param = digitGroup + "," + lang + "," + quadrText + String.fromCharCode(0) + linText +
      String.fromCharCode(0) + constText +String.fromCharCode(0) + modText + String.fromCharCode(0);
    callWorker(param);
  }

  function endFeedback()
  {
    get("main").style.display = "block";
    get("feedback").style.display = "none";
    get("quad").focus();   
  }

let calcURLs = ["quadmodW0000.js",
               "quadmod.webmanifest", "cuadmod.webmanifest", "quadmod-icon-1x.png", "quadmod-icon-2x.png", "quadmod-icon-4x.png", "quadmod-icon-180px.png", "quadmod-icon-512px.png", "favicon.ico"];

function updateInputFromButton(button)
{
  button.onclick = function()
  {
    let input = currentInputBox;
    input.focus();
    let start = input.selectionStart;
    input.value = input.value.substring(0, start) +
                  this.innerText +
                  input.value.substring(input.selectionEnd);
      // Place the caret at the end of the appended text.
    input.selectionStart = start + this.innerText.length;
    input.selectionEnd = input.selectionStart;
  };
}

function completeFuncButtons()
{
  let button;
  let catIndex;
  let funcname = (parens + funcnames[0]).split(",");
  let funcbtns = get("funcbtns");
  currentInputBox = get("quad");
  for (catIndex = 0; catIndex < funcname.length/2; catIndex++)
  {
    button = funcbtns.children[+catIndex];
    button.setAttribute("title", funcname[+catIndex*2]);  // Text of tooltip.
    updateInputFromButton(button);
  } 
}

function generateFuncButtons(optionCategory, funcButtons)
{
  let button;
  let catIndex;
  let funcbtns = get(funcButtons);
  let catnbr = get(optionCategory).selectedIndex;
  let funcname = (parens + funcnames[+catnbr]).split(",");
  // Append all buttons to document fragment instead of funcbtns
  // and finally append the fragment to funcbtns to minimize redraws.
  let fragment = document.createDocumentFragment();
  for (catIndex = 0; catIndex < funcname.length/2; catIndex++)
  {
    button = document.createElement("button");
    button.setAttribute("type", "button");        // Indicate this is a button, not submit.
    button.setAttribute("title", funcname[+catIndex*2]);  // Text of tooltip.
    button.innerHTML = funcname[+catIndex*2 + 1];         // Text of button.
    button.classList.add("funcbtn");
    updateInputFromButton(button);
    fragment.appendChild(button);
  }
  funcbtns.innerHTML = "";
  funcbtns.appendChild(fragment);
}

function getFormSendValue()
{
  get("userdata").value = "ax^2 + bx + c = 0 (mod n)" + 
                     "\na = " + get("quad").value + "\nb = " + get("lin").value +
                     "\nc = " + get("const").value + "\nn = " + get("mod").value;
}

window.onload = function()
{
  get("stop").disabled = true;
  get("solve").onclick = function()
  {
    dowork();
  };
  get("stop").onclick = function()
  {
    worker.terminate();
    worker = 0;
    get("solve").disabled = false;
    get("stop").disabled = true;
    get("result").innerHTML = 
      (lang? "<p>Cálculo detenido por el usuario.</p>" :
                 "<p>Calculation stopped by user</p>");
  };
  get("helpbtn").onclick = function()
  {
    get("help").style.display = "block";
    get("result").style.display = "none";
  };
  get("quad").onfocus = function()
  {
    currentInputBox = get("quad");
  };
  get("lin").onfocus = function()
  {
    currentInputBox = get("lin");
  };
  get("const").onfocus = function()
  {
    currentInputBox = get("const");
  };
  get("mod").onfocus = function()
  {
    currentInputBox = get("mod");
  };
  get("funccat").onchange = function()
  {
    generateFuncButtons("funccat", "funcbtns");
  };
  get("formlink").onclick = function()
  {
    get("main").style.display = "none";
    get("feedback").style.display = "block";
    get("formfeedback").reset();
    get("name").focus();
    return false;   // Do not follow the link.
  };
  get("formcancel").onclick = function()
  {
    endFeedback();
  };
  get("formsend").onclick = formSend;
  currentInputBox = get("quad");
  if ("serviceWorker" in navigator)
  { // Attempt to register service worker.
    // There is no need to do anything on registration success or failure in this JavaScript module.
    navigator["serviceWorker"]["register"]("calcSW.js").then(
              function()
              {
                /* Nothing to do */
              },
              function()
              {
                /* Nothing to do */
              });
    fillCache("cacheQUADMOD");
  }
  completeFuncButtons();
  initMenubarEvents();
};

getCalculatorCode("quadmodW0000.js", false);
