GOV_DIR=`pwd`;
BUILD_DIR='/tmp/build-war-patientbrowser';
APP_NAME='Patient-Browser';
echo 'Building WAR:' $APP_NAME
rm -f $GOV_DIR/$APP_NAME.war
rm -rf $BUILD_DIR
# Create required file structure and content for war
mkdir -p $BUILD_DIR/$APP_NAME/META-INF
mkdir -p $BUILD_DIR/$APP_NAME/WEB-INF
# Copy MANIFEST.MF to /META-INF
echo 'Manifest-Version: 1.0' > $BUILD_DIR/$APP_NAME/META-INF/MANIFEST.MF
cp WEB-INF/web.xml $BUILD_DIR/$APP_NAME/WEB-INF/web.xml
cp error.html $BUILD_DIR/$APP_NAME/
cp login.html $BUILD_DIR/$APP_NAME/ 
cd ..
cp -r build/* $BUILD_DIR/$APP_NAME/
# Create war
cd $BUILD_DIR/$APP_NAME; jar -cvf $GOV_DIR/$APP_NAME.war *; cd $GOV_DIR
rm -rf $BUILD_DIR
