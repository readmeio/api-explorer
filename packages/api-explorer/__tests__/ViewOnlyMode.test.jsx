import React from 'react'
import {mount} from 'enzyme'

import ViewOnlyMode from '../src/components/ViewOnlyMode'

describe('ViewOnlyMode', () => {
  test('correctly invoke ReDoc for get', () => {
    const doc = {
      "_id": "0.7fad969bf1057",
      "title": "Get a list of testv1adapter",
      "slug": "V1adapter",
      "type": "endpoint",
      "category": {
        "apiSetting": "api-setting"
      },
      "api": {
        "method": "get",
        "examples": {
          "codes": [
            {
              "language": "javascript",
              "code": "console.log(1);"
            },
            {
              "language": "curl",
              "code": "curl http://example.com"
            }
          ]
        }
      },
      "swagger": {
        "path": "/v2/v1adapter/"
      },
      "excerpt": "The list can be filtered specifying the following parameters"
    }
    window.Redoc = {
      init: jest.fn()
    }
    mount(<ViewOnlyMode doc={doc} oas={oas} />)
    expect(window.Redoc.init.mock.calls[0][0]).toMatchObject({
      ...oas,
      info: {},
      paths: {
        '/v2/v1adapter/': {
          'get': oas.paths['/v2/v1adapter/'].get
        }
      }
    })
    expect(window.Redoc.init.mock.calls[0][1]).toMatchObject({
      disableSearch: true,
      hideDownloadButton: true,
      lazyRendering: true,
      theme: {
        spacing: {
          sectionHorizontal: 20,
          sectionVertical: 10
        }
      }
    })
  })
})

const oas = {
  "x-explorer-enabled": true,
  "x-samples-enabled": true,
  "x-samples-languages": [
    "curl",
    "node",
    "javascript",
    "java"
  ],
  "x-proxy-enabled": true,
  "x-send-defaults": false,
  "openapi": "3.0.0",
  "security": [
    {
      "APISecretHeader": []
    }
  ],
  "info": {
    "version": "12bd7688957f960c9fb2819517eff4e3116ba51e",
    "title": "Platform Development",
    "description": "Project to try & test feature of the platform"
  },
  "paths": {
    "/v2/v1adapter/": {
      "get": {
        "summary": "Get a list of testv1adapter",
        "description": "The list can be filtered specifying the following parameters",
        "tags": [
          "V1adapter"
        ],
        "parameters": [
          {
            "description": "Hexadecimal identifier of the document in the collection",
            "required": false,
            "name": "_id",
            "in": "query",
            "schema": {
              "type": "string",
              "pattern": "^[a-fA-F\\d]{24}$"
            }
          },
          {
            "description": "creatorId",
            "required": false,
            "name": "creatorId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "description": "createdAt",
            "required": false,
            "name": "createdAt",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date-time",
              "pattern": "^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?(Z|[+-]\\d{2}:\\d{2}))?$"
            }
          },
          {
            "description": "updaterId",
            "required": false,
            "name": "updaterId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "description": "updatedAt",
            "required": false,
            "name": "updatedAt",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date-time",
              "pattern": "^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?(Z|[+-]\\d{2}:\\d{2}))?$"
            }
          },
          {
            "required": false,
            "name": "astring",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "required": false,
            "name": "aNewField",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "description": "Additional query part to forward to MongoDB",
            "required": false,
            "name": "_q",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "description": "Return only the properties specified in a comma separated list",
            "required": false,
            "name": "_p",
            "in": "query",
            "schema": {
              "type": "string",
              "pattern": "^((_id|creatorId|createdAt|updaterId|updatedAt|__STATE__|array1|object1|object2|astring|aNewField),)*(_id|creatorId|createdAt|updaterId|updatedAt|__STATE__|array1|object1|object2|astring|aNewField)$"
            }
          },
          {
            "description": "Filter by \\_\\_STATE__, multiple states can be specified in OR by providing a comma separated list",
            "required": false,
            "name": "_st",
            "in": "query",
            "schema": {
              "type": "string",
              "pattern": "(PUBLIC|DRAFT|TRASH|DELETED)(,(PUBLIC|DRAFT|TRASH|DELETED))*",
              "default": "PUBLIC"
            }
          },
          {
            "description": "Limits the number of documents, max 200 elements, minimum 1",
            "required": false,
            "name": "_l",
            "in": "query",
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 200,
              "default": 25
            }
          },
          {
            "description": "Skip the specified number of documents",
            "required": false,
            "name": "_sk",
            "in": "query",
            "schema": {
              "type": "integer",
              "minimum": 0
            }
          },
          {
            "description": "Sort by the specified property (Start with a \"-\" to invert the sort order)",
            "required": false,
            "name": "_s",
            "in": "query",
            "schema": {
              "type": "string",
              "pattern": "^-?(_id|creatorId|createdAt|updaterId|updatedAt|__STATE__|astring|aNewField)$"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "_id": {
                        "type": "string",
                        "pattern": "^[a-fA-F\\d]{24}$",
                        "description": "_id"
                      },
                      "creatorId": {
                        "type": "string",
                        "description": "creatorId"
                      },
                      "createdAt": {
                        "type": "string",
                        "format": "date-time",
                        "description": "createdAt"
                      },
                      "updaterId": {
                        "type": "string",
                        "description": "updaterId"
                      },
                      "updatedAt": {
                        "type": "string",
                        "format": "date-time",
                        "description": "updatedAt"
                      },
                      "__STATE__": {
                        "type": "string",
                        "description": "__STATE__"
                      },
                      "array1": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "additionalProperties": true
                        }
                      },
                      "object1": {
                        "type": "object",
                        "additionalProperties": true
                      },
                      "object2": {
                        "type": "object",
                        "additionalProperties": true
                      },
                      "astring": {
                        "type": "string"
                      },
                      "aNewField": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Add a new item to the testv1adapter collection",
        "tags": [
          "V1adapter"
        ],
        "requestBody": {
          "$ref": "#/components/requestBodies/Body3"
        },
        "responses": {
          "200": {
            "description": "Default Response",
            "content": {
              "*/*": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "_id": {
                      "type": "string",
                      "pattern": "^[a-fA-F\\d]{24}$",
                      "description": "Hexadecimal identifier of the document in the collection"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "delete": {
        "summary": "Delete items from the testv1adapter collection",
        "tags": [
          "V1adapter"
        ],
        "parameters": [
          {
            "description": "creatorId",
            "required": false,
            "name": "creatorId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "description": "createdAt",
            "required": false,
            "name": "createdAt",
            "in": "query",
            "schema": {
              "type": "string",
              "pattern": "^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?(Z|[+-]\\d{2}:\\d{2}))?$"
            }
          },
          {
            "description": "updaterId",
            "required": false,
            "name": "updaterId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "description": "updatedAt",
            "required": false,
            "name": "updatedAt",
            "in": "query",
            "schema": {
              "type": "string",
              "pattern": "^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?(Z|[+-]\\d{2}:\\d{2}))?$"
            }
          },
          {
            "required": false,
            "name": "astring",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "required": false,
            "name": "aNewField",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "description": "Additional query part to forward to MongoDB",
            "required": false,
            "name": "_q",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "description": "Filter by \\_\\_STATE__, multiple states can be specified in OR by providing a comma separated list",
            "required": false,
            "name": "_st",
            "in": "query",
            "schema": {
              "type": "string",
              "pattern": "(PUBLIC|DRAFT|TRASH|DELETED)(,(PUBLIC|DRAFT|TRASH|DELETED))*",
              "default": "PUBLIC"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Default Response"
          }
        }
      },
      "patch": {
        "summary": "Update the items of the testv1adapter collection that match the query",
        "tags": [
          "V1adapter"
        ],
        "parameters": [
          {
            "description": "Hexadecimal identifier of the document in the collection",
            "required": false,
            "name": "_id",
            "in": "query",
            "schema": {
              "type": "string",
              "pattern": "^[a-fA-F\\d]{24}$"
            }
          },
          {
            "description": "creatorId",
            "required": false,
            "name": "creatorId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "description": "createdAt",
            "required": false,
            "name": "createdAt",
            "in": "query",
            "schema": {
              "type": "string",
              "pattern": "^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?(Z|[+-]\\d{2}:\\d{2}))?$"
            }
          },
          {
            "description": "updaterId",
            "required": false,
            "name": "updaterId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "description": "updatedAt",
            "required": false,
            "name": "updatedAt",
            "in": "query",
            "schema": {
              "type": "string",
              "pattern": "^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?(Z|[+-]\\d{2}:\\d{2}))?$"
            }
          },
          {
            "required": false,
            "name": "astring",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "required": false,
            "name": "aNewField",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "description": "Additional query part to forward to MongoDB",
            "required": false,
            "name": "_q",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "description": "Filter by \\_\\_STATE__, multiple states can be specified in OR by providing a comma separated list",
            "required": false,
            "name": "_st",
            "in": "query",
            "schema": {
              "type": "string",
              "pattern": "(PUBLIC|DRAFT|TRASH|DELETED)(,(PUBLIC|DRAFT|TRASH|DELETED))*",
              "default": "PUBLIC"
            }
          }
        ],
        "requestBody": {
          "$ref": "#/components/requestBodies/Body2"
        },
        "responses": {
          "200": {
            "description": "the number of documents that were modified",
            "content": {
              "*/*": {
                "schema": {
                  "type": "number",
                  "description": "the number of documents that were modified"
                }
              }
            }
          }
        }
      }
    },
  },
  "components": {
    "securitySchemes": {
      "APISecretHeader": {
        "type": "apiKey",
        "in": "header",
        "name": "secret"
      }
    },
    "requestBodies": {
      "Body": {
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": [
                "_id",
                "asField",
                "localField",
                "foreignField"
              ],
              "properties": {
                "_id": {
                  "type": "string",
                  "example": "000000000000000000000000",
                  "pattern": "^[a-fA-F\\d]{24}$",
                  "description": "Hexadecimal identifier of the document in the collection"
                },
                "fromQueryFilter": {
                  "type": "object",
                  "default": {}
                },
                "toQueryFilter": {
                  "type": "object",
                  "default": {}
                },
                "asField": {
                  "type": "string"
                },
                "localField": {
                  "type": "string"
                },
                "foreignField": {
                  "type": "string"
                },
                "fromProjectBefore": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "fromProjectAfter": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "toProjectBefore": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "toProjectAfter": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              },
              "additionalProperties": false
            }
          }
        }
      },
      "Body2": {
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "$set": {
                  "type": "object",
                  "properties": {
                    "array1": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "additionalProperties": true
                      }
                    },
                    "object1": {
                      "type": "object",
                      "additionalProperties": true
                    },
                    "object2": {
                      "type": "object",
                      "additionalProperties": true
                    },
                    "astring": {
                      "type": "string"
                    },
                    "aNewField": {
                      "type": "string"
                    },
                    "array1.$.replace": {
                      "type": "object",
                      "additionalProperties": true
                    },
                    "array1.$.merge": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "additionalProperties": false
                },
                "$unset": {
                  "type": "object",
                  "properties": {
                    "array1": {
                      "type": "boolean",
                      "enum": [
                        true
                      ]
                    },
                    "object1": {
                      "type": "boolean",
                      "enum": [
                        true
                      ]
                    },
                    "object2": {
                      "type": "boolean",
                      "enum": [
                        true
                      ]
                    },
                    "astring": {
                      "type": "boolean",
                      "enum": [
                        true
                      ]
                    },
                    "aNewField": {
                      "type": "boolean",
                      "enum": [
                        true
                      ]
                    }
                  },
                  "additionalProperties": false
                },
                "$inc": {
                  "type": "object",
                  "properties": {},
                  "additionalProperties": false
                },
                "$mul": {
                  "type": "object",
                  "properties": {},
                  "additionalProperties": false
                },
                "$currentDate": {
                  "type": "object",
                  "properties": {},
                  "additionalProperties": false
                },
                "$push": {
                  "type": "object",
                  "properties": {
                    "array1": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "additionalProperties": false
                }
              },
              "additionalProperties": false
            }
          }
        }
      },
      "Body3": {
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": [],
              "properties": {
                "array1": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "additionalProperties": true
                  }
                },
                "object1": {
                  "type": "object",
                  "additionalProperties": true
                },
                "object2": {
                  "type": "object",
                  "additionalProperties": true
                },
                "astring": {
                  "type": "string"
                },
                "aNewField": {
                  "type": "string"
                },
                "__STATE__": {
                  "type": "string",
                  "enum": [
                    "PUBLIC",
                    "DRAFT",
                    "TRASH",
                    "DELETED"
                  ],
                  "description": "The state of the document",
                  "default": "PUBLIC"
                }
              },
              "additionalProperties": false
            }
          }
        }
      },
      "Body4": {
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": [
                "asField",
                "localField",
                "foreignField"
              ],
              "properties": {
                "fromQueryFilter": {
                  "type": "object",
                  "default": {}
                },
                "toQueryFilter": {
                  "type": "object",
                  "default": {}
                },
                "asField": {
                  "type": "string"
                },
                "localField": {
                  "type": "string"
                },
                "foreignField": {
                  "type": "string"
                },
                "fromProjectBefore": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "fromProjectAfter": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "toProjectBefore": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "toProjectAfter": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "toMerge": {
                  "type": "boolean",
                  "default": false
                }
              },
              "additionalProperties": false
            }
          }
        }
      },
      "foo": {
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "lorem": {
                  "$ref": "#/components/bar"
                }
              }
            }
          }
        }
      }
    },
    "bar": {
      "type": "string"
    }
  },
  "tags": [],
  "user": {
    "keys": [
      {
        "name": "project1",
        "apiKey": "123",
        "user": "user1",
        "pass": "pass1"
      },
      {
        "name": "project2",
        "apiKey": "456",
        "user": "user2",
        "pass": "pass2"
      }
    ]
  },
  "servers": [
    {
      "url": "http://localhost:9966"
    }
  ]
}
