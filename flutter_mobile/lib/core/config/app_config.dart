import 'package:flutter/foundation.dart';



class AppConfig {

  const AppConfig._();



  static String get apiBaseUrl {

    if (kIsWeb) {

      return const String.fromEnvironment(

        'ATLAS_API_BASE_URL',

        defaultValue: 'http://10.19.227.145:8080/api/v1',

      );

    }



    return const String.fromEnvironment(
      'ATLAS_API_BASE_URL',
      defaultValue: 'http://10.19.227.145:8080/api/v1',
    );
  }
}
