/** */
const dataObject= new Object();

/** */
function currencyFormat(value, options) {
    options = {minimumFractionDigits: 2, maximumFractionDigits: 2};
    return new Intl.NumberFormat("pt-BR", options).format(value);
}

/** */
async function compleData(account, subAccount){
    account= document.querySelector('select[id="account"]');  
    subAccount= document.querySelector('select[id="subAccount"]');  
    for (let i= 1; i < account.querySelectorAll('option').length; i ++) {  
        Array.from(subAccount.querySelectorAll('optgroup'))
        .filter((optGroup)=> optGroup.label=== account[i].value)
        .forEach((group)=> {   
            Array.from(group.children).forEach((option)=>{              
                account.selectedIndex = i;
                let index= Array.from(subAccount).indexOf(option)  
                subAccount.selectedIndex= index; 
                cashIn= 0, cashOut= 0;
                let dataSet= document.querySelector('input[id="currency"]').getAttribute('data-set');  
                let value= currencyFormat(dataSet.split(',')[index]/100);  
                document.querySelector('input[id="currency"]').value= value;  
                dataObject["Conta"]= account[i].textContent;
                dataObject["Sub-Conta"]= option.textContent;
                account[i].parentElement.label=== 'Entrada'?
                cashIn= value : cashOut= value;                 
                dataObject["Entrada"]= cashIn;
                dataObject["Saída"]= cashOut;   
                const table= document.querySelector('table[id="tableData"] tbody');
                const newRow= table.insertRow()               
                Object.values(dataObject).forEach((value)=>{
                    const newCell= newRow.insertCell();
                    newCell.textContent= value;
                })                     
            })
        }) 
    }  
}

/** */
async function dateInput(target){   
    const hours= new Date().getHours().toString().padStart(2, '0');
    const minutes= new Date().getMinutes().toString().padStart(2, '0');
    const seconds= new Date().getSeconds().toString().padStart(2, '0');
    const utcDate= `${target.value}T${hours}:${minutes}:${seconds}`;   
    dataObject["utcID"]= new Date(utcDate).getTime();
    dataObject["Data"]= target.value.split('-').reverse().join('/');  
    await compleData();    
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
function removeFilter(target, tbody){
    target.removeAttribute('class');
    Array.from(tbody).forEach((tr)=> tr.style.display= '')   
}

/** */
function filterTableData(target, tbody, cellIndex, textContent){
    Array.from(tbody).forEach((tr)=>{ 
        let cellText= tr.cells[cellIndex].textContent.toUpperCase();
        cellText=== textContent.toUpperCase()?
        tr.style.display= '' : tr.style.display= 'none';
    })    
}

/** */
function tableData(target, thead, tbody, cellIndex ,textContent){  
    if (target.closest('tr').className=== "register") return;
    thead= target.closest('table').children[0].rows[1].cells;  
    tbody= target.closest('table').children[1].rows; 
    cellIndex= target.cellIndex;
    textContent= target.textContent; 
    Array.from(thead).forEach((th)=> th.removeAttribute('class'));
    thead[cellIndex].setAttribute('class', 'filter');
    if (target.cellIndex === 1){  
        cellIndex= 0 
        textContent= target.previousElementSibling.textContent;
    }    
    if  (target.className) return removeFilter(target, tbody); 
    filterTableData(target, tbody, cellIndex, textContent)   
}

/** form action */
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('input[id="date"]') 
        .addEventListener("change", (e) => {dateInput(e.currentTarget)        
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
    document.querySelector('input[id="btReport"]')
    .addEventListener("click", (e)=> {
        document.documentElement.style.setProperty('--mainDisplay', 'flex');
        document.documentElement.style.setProperty('--footerDisplay', 'none');
    });
});

/** */
document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelector('table[id="tableData"]')
        .addEventListener("click", (e)=>{tableData(e.target)        
    });
});

/** */
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('input[id="btprint"]')
    .addEventListener("click", (e)=> {
        window.print();
    });
});