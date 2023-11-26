export const fileFiltar = ( req: Express.Request, file: Express.Multer.File, callback: Function) => {

  if ( !file ) return callback( new Error('Archivo vacio'), false );

  const fileEstension = file.mimetype.split('/')[1];
  const validEstensions = ['jpg', 'jpeg', 'png', 'gif'];

  if ( validEstensions.includes(fileEstension) ) {
    return callback( null, true );
  }

  callback(null, false);


}