// =========================
// Datos iniciales
// =========================
let productos = JSON.parse(localStorage.getItem("productos")) || [
  { nombre:"California Roll", descripcion:"Palta, pepino y kanikama", precio:5000, disponible:true },
  { nombre:"Salmón Roll", descripcion:"Queso crema envuelto en salmón", precio:6500, disponible:true },
  { nombre:"Ebi Roll", descripcion:"Camarón tempura y palta", precio:7000, disponible:true }
];

let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// =========================
// Funciones globales
// =========================

// Mostrar productos en index.html
function mostrarProductosMenu() {
  const cont = document.getElementById("menuProductos");
  if(!cont) return;
  cont.innerHTML="";
  productos.forEach((p,i)=>{
    if(!p.disponible) return;
    let div = document.createElement("div");
    div.className="producto";
    div.innerHTML = `
      <img src="assets/sushi${i+1}.jpg" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>${p.descripcion}</p>
      <p class="precio">$${p.precio}</p>
      <button onclick="agregarAlCarrito('${p.nombre}',${p.precio})">Agregar al carrito</button>
    `;
    cont.appendChild(div);
  });
}

// =========================
// Carrito y pedidos
// =========================
function agregarAlCarrito(nombre,precio){
  if(!sessionStorage.getItem("usuario")) { alert("Debe estar logueado"); return;}
  let prod = carrito.find(p=>p.nombre===nombre);
  if(prod) prod.cantidad++;
  else carrito.push({nombre,precio,cantidad:1});
  localStorage.setItem("carrito",JSON.stringify(carrito));
  alert(nombre+" agregado al carrito");
}

function mostrarCarrito(){
  const tabla=document.getElementById("tablaCarrito");
  if(!tabla) return;
  let tbody=tabla.getElementsByTagName("tbody")[0]; tbody.innerHTML="";
  let total=0;
  carrito.forEach((p,i)=>{
    let subtotal=p.precio*p.cantidad; total+=subtotal;
    let fila=document.createElement("tr");
    fila.innerHTML=`<td>${p.nombre}</td><td>$${p.precio}</td><td>${p.cantidad}</td>
    <td>$${subtotal}</td>
    <td><button onclick="eliminarProducto(${i})">Eliminar</button></td>`;
    tbody.appendChild(fila);
  });
  const totalSpan=document.getElementById("total");
  if(totalSpan) totalSpan.textContent=total;
}

function eliminarProducto(index){
  carrito.splice(index,1);
  localStorage.setItem("carrito",JSON.stringify(carrito));
  mostrarCarrito();
}

function vaciarCarrito(){
  carrito=[]; localStorage.removeItem("carrito"); mostrarCarrito();
}

function confirmarPedido(){
  if(carrito.length===0){ alert("Carrito vacío"); return;}
  let usuario=JSON.parse(sessionStorage.getItem("usuario"));
  if(!usuario){ alert("Debe estar logueado"); return;}

  let numPedido=Math.floor(Math.random()*1000000);
  let total=carrito.reduce((sum,p)=>sum+p.precio*p.cantidad,0);
  pedidos.push({numPedido, cliente:usuario.nombre, carrito, total, fecha:new Date().toLocaleString(), estado:"pendiente"});
  localStorage.setItem("pedidos",JSON.stringify(pedidos));

  // Mostrar boleta
  document.getElementById("numPedido").textContent=numPedido;
  document.getElementById("totalBoleta").textContent=total;
  const detalle=document.getElementById("detalleBoleta"); detalle.innerHTML="";
  carrito.forEach(p=>{ let li=document.createElement("li"); li.textContent=`${p.cantidad} x ${p.nombre} - $${p.precio*p.cantidad}`; detalle.appendChild(li);});
  document.getElementById("boleta").classList.remove("oculto");

  vaciarCarrito();
}

// Descargar boleta PDF
function descargarBoletaPDF(){
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();
  let numPedido=document.getElementById("numPedido").textContent;
  let total=document.getElementById("totalBoleta").textContent;
  let detalle = Array.from(document.getElementById("detalleBoleta").children).map(li=>li.textContent);
  doc.text("Boleta N°: "+numPedido,10,10);
  doc.text("Detalle:",10,20);
  detalle.forEach((d,i)=>doc.text(d,10,30+i*10));
  doc.text("Total: $"+total,10,30+detalle.length*10);
  doc.save("boleta.pdf");
}

// =========================
// Registro y login
// =========================
function validarRUN(run){
  run=run.replace(/\./g,"").replace("-","");
  if(run.length<8) return false;
  let cuerpo=run.slice(0,-1); let dv=run.slice(-1).toUpperCase();
  let suma=0,m=2;
  for(let i=cuerpo.length-1;i>=0;i--){ suma+=m*parseInt(cuerpo[i]); m=m<7?m+1:2;}
  let dvE=11-(suma%11); dvE=dvE===11?"0":dvE===10?"K":dvE.toString();
  return dv===dvE;
}

function registrarCliente(){
  let run=document.getElementById("run").value.trim();
  let nombre=document.getElementById("nombre").value.trim();
  let correo=document.getElementById("correo").value.trim();
  let telefono=document.getElementById("telefono").value.trim();
  let password=document.getElementById("password").value.trim();
  let mensaje=document.getElementById("mensajeRegistro");

  if(!validarRUN(run)){ mensaje.textContent="RUN no válido"; mensaje.style.color="red"; return false;}
  if(!correo.includes("@")){ mensaje.textContent="Correo inválido"; mensaje.style.color="red"; return false;}
  if(!/^[0-9]{9}$/.test(telefono)){ mensaje.textContent="Teléfono inválido"; mensaje.style.color="red"; return false;}
  if(password.length<4){ mensaje.textContent="Contraseña muy corta"; mensaje.style.color="red"; return false;}

  clientes.push({run,nombre,correo,telefono,password});
  localStorage.setItem("clientes",JSON.stringify(clientes));
  mensaje.textContent="Cliente registrado"; mensaje.style.color="green";
  document.getElementById("formRegistro").reset();
  return false;
}

function loginUsuario(){
  let correo=document.getElementById("loginCorreo").value.trim();
  let pass=document.getElementById("loginPassword").value.trim();
  let mensaje=document.getElementById("mensajeLogin");
  let user=clientes.find(c=>c.correo===correo && c.password===pass);
  if(!user){ mensaje.textContent="Usuario o contraseña incorrectos"; mensaje.style.color="red"; return false;}
  sessionStorage.setItem("usuario",JSON.stringify(user));
  mensaje.textContent="Login exitoso"; mensaje.style.color="green";
  setTimeout(()=>{ window.location="index.html";},1000);
  return false;
}

// =========================
// Admin
// =========================
function agregarProductoAdmin(){
  let nombre=document.getElementById("prodNombre").value;
  let desc=document.getElementById("prodDescripcion").value;
  let precio=parseInt(document.getElementById("prodPrecio").value);
  let disp=document.getElementById("prodDisponible").value==="true";
  productos.push({nombre,descripcion:desc,precio,disponible:disp});
  localStorage.setItem("productos",JSON.stringify(productos));
  cargarProductosAdmin();
  document.getElementById("formProducto").reset();
  return false;
}

function cargarProductosAdmin(){
  let tabla=document.getElementById("tablaProductosAdmin"); if(!tabla) return;
  let tbody=tabla.getElementsByTagName("tbody")[0]; tbody.innerHTML="";
  productos.forEach((p,i)=>{
    let fila=document.createElement("tr");
    fila.innerHTML=`<td>${p.nombre}</td><td>${p.descripcion}</td><td>$${p.precio}</td>
    <td>${p.disponible?"Sí":"No"}</td>
    <td><button onclick="eliminarProductoAdmin(${i})">Eliminar</button></td>`;
    tbody.appendChild(fila);
  });
}

function eliminarProductoAdmin(i){ productos.splice(i,1); localStorage.setItem("productos",JSON.stringify(productos)); cargarProductosAdmin(); }

function cargarClientesAdmin(){
  let tabla=document.getElementById("tablaClientesAdmin"); if(!tabla) return;
  let tbody=tabla.getElementsByTagName("tbody")[0]; tbody.innerHTML="";
  clientes.forEach(c=>{
    let fila=document.createElement("tr");
    fila.innerHTML=`<td>${c.run}</td><td>${c.nombre}</td><td>${c.correo}</td><td>${c.telefono}</td>`;
    tbody.appendChild(fila);
  });
}

// =========================
// Cajero y Cocina
// =========================
function cargarPedidosCajero(){
  let tabla=document.getElementById("tablaPedidosCajero"); if(!tabla) return;
  let tbody=tabla.getElementsByTagName("tbody")[0]; tbody.innerHTML="";
  pedidos.forEach((p,i)=>{
    if(p.estado!=="pendiente") return;
    let fila=document.createElement("tr");
    fila.innerHTML=`<td>${p.numPedido}</td><td>${p.cliente}</td><td>$${p.total}</td>
    <td><button onclick="confirmarPago(${i})">Confirmar Pago</button></td>`;
    tbody.appendChild(fila);
  });
}

function confirmarPago(i){
  pedidos[i].estado="pagado";
  localStorage.setItem("pedidos",JSON.stringify(pedidos));
  cargarPedidosCajero();
  alert("Pago confirmado. Boleta enviada por correo (simulado).");
}

function cargarPedidosCocina(){
  let tabla=document.getElementById("tablaPedidosCocina"); if(!tabla) return;
  let tbody=tabla.getElementsByTagName("tbody")[0]; tbody.innerHTML="";
  pedidos.forEach((p,i)=>{
    if(p.estado!=="pagado") return;
    let detalle=p.carrito.map(c=>`${c.cantidad} x ${c.nombre}`).join(", ");
    let fila=document.createElement("tr");
    fila.innerHTML=`<td>${p.numPedido}</td><td>${p.cliente}</td><td>${detalle}</td>
    <td><button onclick="marcarDespachado(${i})">Despachado</button></td>`;
    tbody.appendChild(fila);
  });
}

function marcarDespachado(i){ pedidos[i].estado="entregado"; localStorage.setItem("pedidos",JSON.stringify(pedidos)); cargarPedidosCocina(); }

// =========================
// Reportes
// =========================
function generarReporte(){
  let fi=document.getElementById("fechaInicio").value;
  let ff=document.getElementById("fechaFin").value;
  let tabla=document.getElementById("tablaReporte"); if(!tabla) return false;
  let tbody=tabla.getElementsByTagName("tbody")[0]; tbody.innerHTML="";
  let fInicio=new Date(fi), fFin=new Date(ff);
  pedidos.forEach(p=>{
    let fecha=new Date(p.fecha);
    if(fecha>=fInicio && fecha<=fFin){
      let fila=document.createElement("tr");
      fila.innerHTML=`<td>${p.numPedido}</td><td>${p.cliente}</td><td>$${p.total}</td><td>${p.fecha}</td>`;
      tbody.appendChild(fila);
    }
  });
  return false;
}
