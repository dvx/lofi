{
  "targets": [
    {
      "target_name": "volume",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [ "./src/native/volume/volume.cc" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    },
    {
      "target_name": "black-magic",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [ "./src/native/black-magic/black-magic.cc" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
      "conditions": [
        ['OS=="mac"',
          {
            'defines': [
              '__MACOSX_CORE__'
            ],
            'link_settings': {
                'libraries': [
                  '-framework CoreFoundation',
                ]
            },
            'xcode_settings': {
                'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
                'CLANG_CXX_LIBRARY': 'libc++',
                'OTHER_CFLAGS': [
                  '-ObjC++',
                  '-std=c++11'
                ],
            },
          }
        ],
        ['OS=="win"',
          {
          }
        ]
    ],
    }
  ]
}
