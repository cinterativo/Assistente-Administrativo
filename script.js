/** */
const dataObject= new Object();

/** */
function currencyFormat(value, options) {
    options = {minimumFractionDigits: 2, maximumFractionDigits: 2};
    return new Intl.NumberFormat("pt-BR", options).format(value);
}

/** */
function clearElements(target){
    let userInput= target.parentElement.querySelectorAll('.userInput');
    index= Array.from(userInput).indexOf(target) + 1;
    for (i= index; i < Array.from(target.parentElement).length -5; i++){
        Array.from(userInput)[i].value="";
        Array.from(userInput)[i].disabled=true;
    }
}

/** */
function openDialog(target){
    const className= [target.id, target.value];
    const dialog= document.querySelector('dialog[id="dialog"]');
    dialog.querySelector('input[id="textDialog"]').className= className;            
    dialog.show();
}

/** */
function dateInput(target){   
    const hours= new Date().getHours().toString().padStart(2, '0');
    const minutes= new Date().getMinutes().toString().padStart(2, '0');
    const seconds= new Date().getSeconds().toString().padStart(2, '0');
    const utcDate= `${target.value}T${hours}:${minutes}:${seconds}`;    
    clearElements(target);
    document.querySelector('select[id="account"]').disabled= target.value== "";  
    dataObject["utcID"]= new Date(utcDate).getTime();
    dataObject["Data"]= target.value.split('-').reverse().join('/');    
    automaticData(target);
}

/** */ 
function accountSelect(target){
    clearElements(target);
    subAccount= document.querySelector('select[id="subAccount"]');
    subAccount[subAccount.options.length -1].value= target.value;
    subAccount.disabled= target.selectedIndex == 0;
    Array.from(subAccount.querySelectorAll('optgroup')).forEach((group)=>{
        if(group.label === target.value)
            return group.style.display= '';
        group.style.display= 'none';
    })    
    dataObject["Conta"]= target[target.selectedIndex].textContent;
}

/** */
function subAccountSelect(target){
    clearElements(target)
    document.querySelector('input[id="currency"]').disabled=
    target.selectedIndex== target.options.length -1;   
    if (target.selectedIndex== target.options.length -1) openDialog(target);
    dataObject["Sub-Conta"]= target[target.selectedIndex].textContent;
}

/** */
function currencyInput(target, cashIn= 0, cashOut= 0){
    const value= target.value.replace(/[^0-9]+/g, ''); //replace(/\D+/g, '')
    target.value= currencyFormat(value/ 100);  
    const account= document.querySelector('select[id="account"]');    
    account[account.selectedIndex].parentElement.label=== 'Entrada'?
    cashIn= value : cashOut= value; 
    document.querySelector('input[id="save"]').disabled= value < 100;  
    dataObject["Entrada"]= currencyFormat(cashIn/ 100);
    dataObject["Saída"]= currencyFormat(cashOut/ 100);    
}

/** */
function cancelInput(target){
    document.querySelector('input[id="date"]').value= "";
    clearElements(document.querySelector('input[id="date"]'));
}

/** */
function saveInput(target){
    const userInput= target.closest('form').querySelectorAll('.userInput');
    const table= document.querySelector('table[id="tableData"] tbody');
    const newRow= table.insertRow(0)
    Array.from(Object.values(dataObject)).forEach((item)=>{
        const newCell= newRow.insertCell();
        newCell.textContent=item;
    })
}

/** */
function textDialogInput(target){
    document.querySelector('input[id="saveDialog"]').disabled=
    target.value.length < 10;
}

/** */
function closeDialog(target){
    const dialog= target.closest('dialog');
    dialog.querySelector('input[id="textDialog"]').value= ''; 
    dialog.querySelector('input[id="saveDialog"]').disabled= true;
    dialog.close();
}

/** */
function saveDialogInput(target){
    const dialog= target.closest('dialog');
    optGroup= dialog.querySelector('input[id="textDialog"]').className;
    text= dialog.querySelector('input[id="textDialog"]').value;
    let select= document.querySelector(`select[id=${optGroup.split(',')[0]}]`);     
    select.querySelector(`optgroup[label=${optGroup.split(',')[1]}]`)
    .append(new Option(text));
    closeDialog(dialog);
}

/** */
function reportPeriod(target){
    const date= new Date(); 
    obj= {
        "day":  date.setDate(date.getDate()),
        "week": date.setDate(date.getDate()- (date.getDay() - 1)),
        "week-1": date.setDate(date.getDate()- ((date.getDay() - 1) + 7)),
        "month": date.setMonth(date.getMonth(), 1),
        "month-1": date.setMonth((date.getMonth()- 1), 1),
        "month-2": date.setMonth((date.getMonth()- 1), 1),
        "fullYear": date.setFullYear(date.getUTCFullYear(), 0, 1)
    }
    const index= Array.from(Object.keys(obj)).indexOf(target.value);
    const utcDate= Array.from(Object.values(obj))[index];    
    return new Date(utcDate).setHours('00','00','00','0000');
}

/** */
function tbodyData(table, period, arr=[]){      
    Array.from(table.rows).forEach((tr)=> {
       if(Array.from(tr.children)[0].textContent >=  period)
            arr.push(tr)
    })
    return arr;
}

/** */
function createNodeFromArray(data, parentElement, element){
    data.forEach((row)=>{     
        row.forEach((cell)=>{
            let nodeElement= document.createElement(element);               
            nodeElement.textContent= cell;
            parentElement.append(nodeElement); 
        })
    })
}

/** */
function createNodeFromNodeList(data, parentElement, element){
    data.forEach((tr)=>{            
        Array.from(tr.children).forEach((td)=>{ 
            let span= document.createElement("span");               
            span.textContent= td.textContent;
            parentElement.append(span);
        })
    })
}

/** */
function deleteElements(element, length){  
    while (element.children.length > length){
        element.removeChild(element.childNodes[length]);
    }    
}

/** */
function tbodyReduce(tbody, index, arr=[]){
    tbody.forEach((tr)=> arr.push(Array.from(tr.children)[index].textContent))   
    return arr.reduce((acumulator, cValue)=> 
    Number(acumulator) + Number(cValue.replace(/[^0-9]+/g, '')), 0);
}

/** */
function selectReport(target){    
    let ul= document.querySelector('ul[id="report"]');
    const table= target.closest("table");  
    const option= target[target.selectedIndex].textContent;    
    const period= reportPeriod(target);
    const thead= [Array.from(table.querySelector('thead').children)[1]]
    const tbody= tbodyData(table.querySelector('tbody'), period); 
    const dataReport= ul.querySelector('li[class="main"]');    
    if (dataReport.children.length) deleteElements(dataReport, 0);  
    createNodeFromNodeList(thead, dataReport, "li");
    createNodeFromNodeList(tbody, dataReport, "li");
    const cashIn= currencyFormat(tbodyReduce(tbody, 4)/ 100);
    const cashOut= currencyFormat(tbodyReduce(tbody, 5)/ 100);
    const sum= new Array(["","","","Soma:",cashIn,cashOut]);    
    createNodeFromArray(sum, dataReport, "span");
    target.selectedIndex= 0;
    document.querySelector('ul[id="report"] li span[id="period"]').textContent= `Caixa: ${option}:`;
    document.documentElement.style.setProperty('--mainDisplay', 'none');
    document.documentElement.style.setProperty('--footerDisplay', 'flex');
}

/** */
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('input[id="btReport"]')
    .addEventListener("click", (e)=> {
        document.documentElement.style.setProperty('--mainDisplay', 'flex');
        document.documentElement.style.setProperty('--footerDisplay', 'none');
    });
});

/** form action */
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('input[id="date"]') 
        .addEventListener("change", (e) => {dateInput(e.currentTarget)        
    });
});
/** */
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('select[id="account"]')
        .addEventListener("change", (e) => {accountSelect(e.currentTarget)        
    });
});
/** */
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('select[id="subAccount"]')
        .addEventListener("change", (e) => {subAccountSelect(e.currentTarget)        
    });
});
/** */
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('input[id="currency"]')
        .addEventListener("input", (e) => {currencyInput(e.currentTarget)        
    });
});
/** */
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('input[id="cancel"]')
        .addEventListener("click", (e)=> {cancelInput(e.target)        
    });
});
/**/
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('input[id="save"]')
        .addEventListener("click", (e)=> {saveInput(e.target)        
    });
});
/** dialog */ 
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('dialog[id="dialog"]')
        .addEventListener("close", (e)=> {closeDialog(e.target)    
    });
});
/** */
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('input[id="textDialog"]')
        .addEventListener("input", (e)=> {textDialogInput(e.target)        
    });
});
/** */
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('input[id="cancelDialog"]')
        .addEventListener("click", (e)=> {closeDialog(e.target)        
    });
});
/** */
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('input[id="saveDialog"]')
        .addEventListener("click", (e)=> {saveDialogInput(e.target)        
    });
});

/** Report */
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('select[id="selectReport"]')
        .addEventListener("change", (e)=> {selectReport(e.currentTarget)        
    });
});

/** */
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('input[id="btprint"]')
    .addEventListener("click", (e)=> {
        document.querySelector('ul[id="report"]').contentWindow.print();
    });
});
