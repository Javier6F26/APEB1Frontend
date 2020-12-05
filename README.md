Tarea 2
# APEB1FE
[APEB1-20%]

Implementar mecanismos de seguridad y utilización de algoritmos de encriptación en un sistema pequeño.
Por: Javier E. Sánchez Fernández

Descripción:
Para realizar el ejercicio he desarrollado un sistema pequeño en el que se pueden listar, registrar modificar y eliminar usuarios. De igual forma se puede asignar permisos en base a roles y/o permisos personalizados por modulo.



Tecnologías Implementas:







•	Angular 10+
•	Socket.IO
•	NodeJS
•	ExpressJS
•	JWT.IO
•	Amazon EC2
•	Ubuntu Server 20+
•	Let’s Encrypt SSL
•	Mongo DB

El sistema consta de dos partes.

1.	El frontend es un aplicativo web cliente desarrollado en Typescript sobre el framework Angular 10+ compilado a ecmascript 5 desplegado en apache sobre Ubuntu Server 20.04LTS
2.	El servidor esta escrito en Typescript compilado a ecmascript 5 desplegado en NodeJS con administrador de procesos de NodeJS PM2 sobre Ubuntu Server 20.04LTS
    El sistema posee un sistema de autenticación “Passwordless”, una vez que se ingresa el nombre usuario, el servidor envía un código de verificación SMS para continuar.

Medidas de Seguridad del Software:

1.	Para autenticar se genera un token formado por el algoritmo RS256 con una llave privada RSA de 2048bits con un tiempo de expiración de 300 segundos.

2.	Se verifica que el token de autenticación sea valido antes de buscar el código en la base de datos para compararlo

3.	Si el token es valido y el código coincide, se genera un nuevo token de sesión firmado con otra clave RSA de 2048 bits y es enviado al cliente que, mediante Web Sockets retorna el token en el handshake y se verifica para poder realizar la conexión.

4.	Se firma con dos llaves RSA distintas el token de autenticación y el token de sesión. Esto es por que los algoritmos de hash como el RS256 pueden ser violentados mediante ataques de fuerza bruta con claves menores a 512 bits. A pesar de esto, si un atacante lograse conseguir la clave privada de autenticación, esta clave no podría conectar el socket. Para realizar un ataque de fuerza bruta al token de sesión se necesitaría robar el token de un usuario previamente autenticado aumentando así la dificultad del ataque.

5.	El servidor mediante CORS limita las conexiones a solo las provenientes del dominio y permite solo solicitudes “post”, que son las únicas utilizadas.



Medidas de Seguridad del Despliegue:

1.	El servidor se encuentra desplegado en una instancia del servicio EC2 de AWS el cual brinda protecciones ante los ataques mas comunes como DDoS  
    https://aws.amazon.com/es/shield/

2.	La Base de datos solo acepta solicitudes de 127.0.0.1





3.	La conexión de web sockets se realiza a través de HTTPS verificando los certificados SSL del dominio, así el frontend puede estar seguro de que se está conectando al servidor correcto


Servidor



Cliente


4.	Los únicos puertos abiertos en el servidor son el 45001 del WebSocket, el 443 de HTTPS y el 80 de HTTP, aunque este ultimo es siempre redirigido por apache en el frontend y no es escuchado por el servidor Express.














Diagrama del proceso de autenticación:


Proceso de Autenticación

1.	Se ingresa el nombre de usuario registrado





2.	El servidor busca el nombre de usuario en la base de datos. Si encuentra coincidencia la retorna como un arreglo de objetos “User”. Como el campo “userName” en la base de datos es único, la respuesta de la llamada a la base de datos es un arreglo de un solo objeto cuyo índice seria 0. Para evitar ataques del tipo “JSON Inyection” se crea un nuevo objeto tomando solo los campos necesarios del objeto “user[0]”. Si se intentara recuperar mediante “JSON Inyection” la lista de todos los usuarios, en este punto el sistema lanzaría un error del tipo “ReferenceError” ya que “users[0]” seria un arreglo anidado y no definiría las propiedades características del objeto.













3.	Seguidamente se crea una clave de 6 dígitos numéricos aleatorios la cual se almacena en la base de datos, el “_id” insertado se adjunta a los datos públicos del usuario y se los firma con la librería JWT con una expiración de 300 segundos. Una vez firmado, se envía el token al usuario.

Para el uso didáctico de esta aplicación, también se adjunta la clave numérica generada al token en la respuesta al cliente, aunque esta debería ser enviada a un api de SMS para que sea puesta a disposición del usuario en su teléfono móvil.



4.	Una vez ingresado el código se lo envía al servido junto al token generado. Se verifica que el token que se recibe haya sido firmado con la misma llave y que no haya expirado, se descodifica y se extrae el valor “_id” del código enviado por SMS. Se recupera el código de la base de datos y se compara con el código ingresado por el usuario. Si es correcto, el inicio de sesión ha sido exitoso. Se elimina el código de la base de datos y se genera un nuevo token firmado con una segunda llave privada.




5.	Una vez se haya recibido un token de sesión valido, el frontend crea una conexión con el servidor mediante Web Sockets enviado en el handshake el token de autenticación.





6.	El servidor verifica la firma y el tiempo de expiración del token del handshake de la conexión entrante y si todo es correcto permite la conexión de sockets, se decodifica el token y se obtiene el id de usuario.













Para verificar si un usuario tiene permiso para leer, crear, modificar, o eliminar objetos de la base de datos, se lee la matriz de permisos en la base de datos en cada llamada al evento del socket.







El sistema esta desplegado bajo el dominio https://app-server.pro. El usuario maestro es “admin”
El código completo reposa en GitHub abierto al publico en:

Frontend
https://github.com/Javier6F26/APEB1Frontend
Backend
https://github.com/Javier6F26/APEB1Server

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.2.3.
by Javier E. Sánchez Fernández UTPL 2020

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
