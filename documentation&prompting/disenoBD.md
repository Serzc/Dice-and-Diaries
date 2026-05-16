Instituto Tecnológico de Costa Rica
Campus Tecnológico Central Cartago



Escuela de Ingeniería en Computación
Diseño de Software

Diseño de Base de Datos:
Dice and Diaries
 
Profesor
Mario Chacon Rivas
 
Integrantes

José Ignacio Madriz Ortiz
Sergio Andrés Zúñiga Castillo






Periodo
I Semestre 2026
Tabla de Contenidos
Tabla de Contenidos	2
Introducción	3
Modelo de Datos	3
Decisiones	3
Tamaños de dato	4
Tipos de dato	4
Tamaños de tabla	5
Estándares	6
Nombres de Tablas y Columnas	6
Formato de strings especiales	7
Diagramas	8
Conclusiones	10

Introducción
El diseño de la base de datos para Dice and Diaries responde directamente a los principios definidos en el proyecto: accesibilidad, simplicidad, rendimiento y personalización. En lugar de optar por una normalización exhaustiva o una estructura altamente fragmentada, se priorizó un modelo que permita almacenar y recuperar información de manera eficiente, manteniendo al mismo tiempo la flexibilidad necesaria para adaptarse a la naturaleza dinámica del juego.

Modelo de Datos
Decisiones
Una de las decisiones más relevantes en este diseño es el uso de campos tipo string para representar ciertos conjuntos de datos complejos, como habilidades, competencias o estadísticas del personaje. Aunque desde una perspectiva tradicional estos elementos podrían descomponerse en múltiples tablas relacionadas, se optó por una representación más compacta con formatos definidos. Esta decisión reduce significativamente la cantidad de joins necesarios en consultas frecuentes, mejora el rendimiento en tiempo de ejecución, simplifica la implementación inicial, reduce la cantidad de información guardada y permite ser más flexibles con las opciones del juego.

Otro aspecto clave del diseño es el uso extensivo de tablas intermedias para relaciones (como CharacterXCampaign, ItemXCharacter o SpellXCreature). Estas tablas permiten modelar relaciones de muchos a muchos de manera clara y escalable, reflejando correctamente la complejidad del dominio: un personaje puede participar en múltiples campañas, un objeto puede pertenecer a varias entidades y los hechizos pueden variar según el contexto. Asimismo, estas tablas no solo gestionan asociaciones, sino que también almacenan atributos propios de la relación, como estados (equipado, preparado) o cantidades, lo cual enriquece la expresividad del modelo.

Adicionalmente, el sistema incorpora el concepto de borrado lógico mediante el atributo “active”, permitiendo preservar información histórica sin eliminarla físicamente de la base de datos. Esta decisión es especialmente importante en un entorno narrativo como Dungeons and Dragons, donde la trazabilidad de eventos, personajes y decisiones forma parte esencial de la experiencia.

En conjunto, el diseño busca un equilibrio entre estructura y flexibilidad, evitando tanto la rigidez de modelos excesivamente normalizados como la ambigüedad de esquemas poco definidos. Esto permite construir una base sólida que soporta las funcionalidades principales del sistema, al mismo tiempo que facilita futuras extensiones y mejoras conforme evolucionen las necesidades de los usuarios.
Tamaños de dato
En esta sección brevemente se comentará algunos de los tamaños de datos, sin embargo, no se mencionan todos los casos porque un análisis exhaustivo se volverá repetitivo.
En el caso de números, la gran mayoría de estos, a excepción de las llaves foráneas, corresponden a datos bastante pequeños, en rara vez algún número sobrepasa los 3 dígitos pues el sistema de juego de rol está diseñado para hacer los cálculos fácilmente, por lo que todos esos casos se convierten en “smallint”.
En el caso de los strings, se utilizan varchars de distintos tamaños para distintos escenarios, los más comunes son:
<=16 : aquellos campos con formatos específicos y que se guardan de esta manera para tener información de manera compacta, por ejemplo, los puntajes de habilidad son números entre 0 y 20, por lo que una cadena de 12 caracteres (2 caracteres x 6 habilidades) es suficiente para resumir esa información.
<= 64 : Estos se utilizan en identificadores como nombres de personajes o campañas.
<=128: Caso similar a los identificadores pero solamente aquellos que en casos extremos es probable que sobrepasan los 64.
<=512: En textos que no son tan grandes como una nota pero sí requieren espacio suficiente para dar una explicación concreta como describir el funcionamiento de una habilidad o una descripción de un objeto.
<= 4096: Tras un breve análisis, se concluyó que este es un buen número de caracteres para las notas. No es inmenso como para que tomen mucho espacio en la base de datos y es un tamaño decente para notas concisas.
Tipos de dato
Esta sección cubre los fundamentos que apoyan las decisiones de diseño detrás de los tipos de datos para los registros de las columnas, enfocándose en una descripción general en lugar de un análisis exhaustivo para cada instancia.

Las llaves primarias y foráneas utilizan tipos enteros, lo cual es una práctica estándar que facilita operaciones de búsqueda y facilita la integridad referencial. No se espera que en el sistema lleguen a existir suficientes entidades tal que un entero no sea suficiente para representarlo.

Nombres, descripciones, etiquetas y otros valores de texto utilizan tipos varchar,  cuyos tamaños ya han sido justificados. En el diseño existen indicadores de estado para determinar varios aspectos (como visibilidad o accesibilidad a un elemento) que se guardan en un tipo bool ya que la base de datos estará en Supabase el cual usa PostgreSQL donde el bool da más claridad de uso que el clásico bit. Finalmente, para el caso de Mensajes se utiliza el tipo datetime, que guarda la fecha y hora precisa del evento relacionado, lo cual permite que se cree un historial preciso.
Tamaños de tabla
Esta sección presenta un análisis general de las tablas y las razones de diseño que justifican su tamaño dentro del sistema, contemplando tanto su uso actual como una proyección razonable al crecimiento en la cantidad de entidades.

Las tablas principales, aquellas que guardan usuarios, personajes, campañas y criaturas, se esperan que tengan un crecimiento moderado pero no descontrolado, ya que cada registro usualmente está relacionado a registros relacionados en otras tablas, i.e se registra un usuario que crea personajes y criaturas y los asocia a campañas.

Se espera que las tablas que experimenten crecimientos más explosivos son aquellas que resuelven las asociaciones muchos a muchos, las tablas intermedias. Estas tendrán muchos registros constantemente, pero cada registro consiste principalmente de llaves foráneas y algunos atributos pequeños, entonces su impacto en almacenamiento no resulta impactante.

También es esperable que las tablas de registro de actividad, como mensajes o notas, acumulen una mayor cantidad de datos en poco tiempo ya que una sesión muchas de estas entidades son creadas por el chat. Precisamente por esa razón, se escogieron los tipos de datos eficientes y estructuras simplificadas del esquema.

A continuación se presenta un análisis tabla por tabla de su tamaño, decisiones de optimización y diseño para escalabilidad:

User
Tabla de crecimiento moderado. Se optimiza mediante el uso de tipos compactos (int, varchar acotado) y un campo bit para estado. Escala bien al no manejar grandes volúmenes de texto ni relaciones excesivas directas.
Character
Crecimiento medio, dependiente de la cantidad de jugadores. Se prioriza flexibilidad en atributos complejos (stats) usando varchar, reduciendo número de tablas. Escalable, aunque con posible mejora futura mediante normalización parcial.
Creature
Similar a CHARACTER pero con mayor volumen potencial (uso por GMs). Diseño optimizado al mantener estructura uniforme. Escala adecuadamente gracias a su simplicidad, aunque puede crecer más rápido que personajes.
CreatureFolder y CreatureFolderContent
Crecimiento bajo a medio. Uso de jerarquía con referencia a sí misma (parentFolderId). Diseño liviano, adecuado para escalabilidad sin impacto significativo.
Item
Tabla relativamente estática, con crecimiento bajo. Uso de varchar para descripciones. Optimizada para lectura frecuente y sin impacto relevante en almacenamiento.
Spell
Similar a Item en comportamiento. Crecimiento controlado y estructura simple. Escala sin inconvenientes.
ItemXCharacter y ItemXCharacter
Tablas de relación con crecimiento alto. Optimizadas mediante uso exclusivo de llaves y pocos atributos adicionales (quantity, equipped). Escalables por su bajo peso por fila..
SpellXCharacter y SpellXCreature
Tabla intermedias de crecimiento alto. Uso de atributos mínimos (prepared). Optimizadas para consultas rápidas y escalabilidad.
Campaign
Crecimiento moderado. Cada registro representa una unidad grande del sistema. Uso de campos de texto limitados. Escala bien al no generar alta cardinalidad.
UserXCampaing y CharacterXCampaign
Tablas de relación con crecimiento más manejable. Optimizada con solo llaves foráneas. Escalables sin problemas por su bajo tamaño por registro.
Chat
Crecimiento bajo a medio. Representa instancias de comunicación. Diseño liviano, sin impacto significativo en almacenamiento. Crece al mismo ritmo que Campaign pero permite ordenar mejor el sistema de mensajes.
Message
Tabla de alto crecimiento. Se optimiza usando tipos eficientes y evitando redundancias. Puede escalar considerablemente, pero su estructura simple mitiga el impacto.
Note
Crecimiento medio-alto. Contiene texto variable, lo que incrementa el tamaño por fila. Se mantiene flexible, aunque puede requerir control futuro si el volumen crece significativamente.
NotePermission
Crecimiento medio. Relaciona usuarios con notas. Diseño compacto basado en llaves y nivel de permiso. Escalable sin inconvenientes.
CampaignNoteFolder y NoteFolderContent
Crecimiento bajo. Similar a otras estructuras jerárquicas. Impacto mínimo en almacenamiento y buena escalabilidad.
Estándares
Nombres de Tablas y Columnas
Los nombres y columnas en tablas están en inglés pues el material fuente se encuentra principalmente en inglés, por lo que es más sencillo asociar los conceptos directamente a nuestro modelo.

Los nombres de las tablas son bastante comunes, inician con mayúscula pues son, en esencia, objetos. Siguen el formato de CamelCaseUpper, para visualmente distinguirlas y que resalten en consultas SQL. La mayoría de tablas de relaciones presentan los nombres de las tablas que unen junto a una “X”, excepto en casos que sea necesario explicar el propósito de la tabla, como lo es NotePermission, que explica los permisos de un usuario a una nota. 

Las columnas vienen en formato camelCaseLower, donde la primera palabra comienza con minúscula y cualquier palabra que la proceda en mayúscula. Este formato se utiliza porque permite nombres descriptivos y explícitos de la información de una columna, sin recurrir al sobreuso de caracteres como la barra baja. 
Formato de strings especiales
En distintos casos, se guarda información como una string que siga un formato específico que se definirá detalladamente a futuro. Esto permite guardar información o series de datos de una manera estándar que se pueda leer fácilmente a la hora de cargar los datos en donde sea necesario. Algunos campos que cumplen esto son las habilidades o características de un personaje, las cuales se utilizarán para automatizar operaciones y tiradas de dados de un personaje. Algunos ejemplos de estos formatos son:
Puntajes de habilidad (12 caracteres): corresponden a 2 dígitos x 6 habilidades. Las habilidades siempre se leen en el mismo orden, por ejemplo: “151214100811” es equivalente a: Fuerza 15, Destreza 12, Constitución 14, Inteligencia 10, Sabiduría 8 y Carisma 11.
Proficiencias: Estos corresponden a modificadores que dependen del puntaje de habilidad y un booleano que indica si es proficiente o no, por lo que una cadena binaria es más que suficiente para calcular esa información.
Efectos de habilidades, hechizos, u objetos: En la mayoría de casos, las habilidades, hechizos, u objetos traen consigo efectos o nuevos ataques, por lo que se generará un formato sencillo similar a un JSON que detalle si es un modificador a alguna habilidad, algún ataque u otra opción que pueda ser considerada para automatización.
Diagramas

Figura 1: Clases con tamaño de dato detallado

Figura 2: Diagrama de relaciones

Para visualizar mejor el diagrama se recomienda utilizar PlantUML en el siguiente link.
Conclusiones

En general, el diseño de la base de datos cumple bien con lo que el proyecto necesitaba desde el inicio: algo funcional, claro y que no se vuelva difícil de implementar. Se tomaron decisiones conscientes para no complicar el modelo, como agrupar ciertos datos en strings o evitar una normalización extrema. Esto hace que el sistema sea más fácil de trabajar en la práctica, especialmente considerando que es un entorno dinámico como un juego de rol.
También se nota que se pensó en cómo va a crecer el sistema. Las tablas que más van a aumentar (como las intermedias o los mensajes) están diseñadas para ser livianas, lo cual ayuda a que el rendimiento no se vea afectado conforme haya más usuarios o más actividad. Además, mantener estructuras simples y consistentes facilita que el sistema escale sin tener que rehacer todo más adelante. En conjunto, es una base sólida, bien pensada para el contexto del proyecto y lo suficientemente flexible como para adaptarse a cambios conforme el sistema evolucione.

