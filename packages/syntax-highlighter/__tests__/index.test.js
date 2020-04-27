const { mount, shallow } = require('enzyme');
const syntaxHighlighter = require('..');

test('should highlight a block of code', () => {
  const code = shallow(syntaxHighlighter('var a = 1;', 'javascript'));

  expect(code.hasClass('cm-s-neo')).toBe(true);
  expect(code.html()).toBe(
    '<span class="cm-s-neo"><span class="cm-keyword">var</span> <span class="cm-def">a</span> <span class="cm-operator">=</span> <span class="cm-number">1</span>;</span>'
  );
});

test('should work when passed a non-string value', () => {
  expect(() => syntaxHighlighter(false, 'text')).not.toThrow();
});

test('should sanitize plain text language', () => {
  expect(shallow(syntaxHighlighter('& < > " \' /', 'text')).html()).toContain('&amp; &lt; &gt; &quot; &#x27; /');
});

test('should sanitize mode', () => {
  expect(shallow(syntaxHighlighter('&', 'json')).html()).toContain('&amp;');
  expect(shallow(syntaxHighlighter('<', 'json')).html()).toContain('&lt;');
});

test('should concat the same style items', () => {
  // This is testing the `accum += text;` line
  expect(shallow(syntaxHighlighter('====', 'javascript')).text()).toContain('====');
});

test('should work with modes', () => {
  expect(shallow(syntaxHighlighter('{ "a": 1 }', 'json')).html()).toBe(
    '<span class="cm-s-neo">{ <span class="cm-property">&quot;a&quot;</span>: <span class="cm-number">1</span> }</span>'
  );
});

test('should have a dark theme', () => {
  expect(shallow(syntaxHighlighter('{ "a": 1 }', 'json', { dark: true })).hasClass('cm-s-tomorrow-night')).toBe(true);
});

test('should tokenize variables (double quotes)', () => {
  expect(mount(syntaxHighlighter('"<<apiKey>>"', 'json', { tokenizeVariables: true })).find('Variable')).toHaveLength(
    1
  );
});

test('should tokenize variables (single quotes)', () => {
  expect(mount(syntaxHighlighter("'<<apiKey>>'", 'json', { tokenizeVariables: true })).find('Variable')).toHaveLength(
    1
  );
});

test('should keep enclosing characters around the variable', () => {
  expect(mount(syntaxHighlighter("'<<apiKey>>'", 'json', { tokenizeVariables: true })).text()).toBe("'APIKEY'");
});

// https://github.com/leachim6/hello-world/
describe('supported languages', () => {
  it('asp', () => {
    const code = `<%@ Language= "VBScript" %>
<%
  Response.Write("Hello World")
%>`;

    expect(shallow(syntaxHighlighter(code, 'asp')).html()).toMatchSnapshot();
  });

  it('c', () => {
    const code = `#include <stdio.h>

int main() {
  printf("Hello World\n");
  return 0;
}`;

    expect(shallow(syntaxHighlighter(code, 'c')).html()).toMatchSnapshot();
  });

  it('c++', () => {
    const code = `#include <iostream>

using namespace std;

int main()
{
  cout << "Hello World\n";
}`;

    const cplusplus = shallow(syntaxHighlighter(code, 'cplusplus')).html();

    expect(cplusplus).toMatchSnapshot();
    expect(shallow(syntaxHighlighter(code, 'cpp')).html()).toStrictEqual(cplusplus);
    expect(shallow(syntaxHighlighter(code, 'c++')).html()).toStrictEqual(cplusplus);
  });

  it('c#', () => {
    const code = `class HelloWorld {
  static void Main() {
    System.Console.WriteLine("Hello World");
  }
}`;

    const csharp = shallow(syntaxHighlighter(code, 'csharp')).html();

    expect(csharp).toMatchSnapshot();
    expect(shallow(syntaxHighlighter(code, 'cs')).html()).toStrictEqual(csharp);
  });

  it('css flavors', () => {
    const code = `body::before {
  content: "Hello World";
}`;

    const css = shallow(syntaxHighlighter(code, 'css')).html();

    expect(css).toMatchSnapshot();
    expect(shallow(syntaxHighlighter(code, 'scss')).html()).toStrictEqual(css);
    expect(shallow(syntaxHighlighter(code, 'stylus')).html()).toStrictEqual(css);
  });

  it('cURL', () => {
    const code = `curl --request GET \
  --url 'https://dash.readme.io/api/v1/api-specification?perPage=10&page=1' \
  --header 'x-readme-version: v3.0'`;

    expect(shallow(syntaxHighlighter(code, 'curl')).html()).toMatchSnapshot();
  });

  it('dart', () => {
    const code = `main() {
  print('Hello World');
}`;

    expect(shallow(syntaxHighlighter(code, 'dart')).html()).toMatchSnapshot();
  });

  it('dockerfile', () => {
    const code = `FROM alping:3.4`;
    expect(shallow(syntaxHighlighter(code, 'dockerfile')).html()).toMatchSnapshot();
  });

  it('go', () => {
    const code = `package main

import "fmt"

func main() {
  fmt.Println("Hello World")
}`;

    expect(shallow(syntaxHighlighter(code, 'go')).html()).toMatchSnapshot();
  });

  it('html', () => {
    const code = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World!</title>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
  </html>`;

    const html = shallow(syntaxHighlighter(code, 'html')).html();

    expect(html).toMatchSnapshot();
    expect(shallow(syntaxHighlighter(code, 'xhtml')).html()).toMatchSnapshot(); // @fix this
  });

  it('java', () => {
    const code = `public class Java {
  public static void main(String[] args) {
    System.out.println("Hello World");
  }
}`;

    expect(shallow(syntaxHighlighter(code, 'java')).html()).toMatchSnapshot();
  });

  describe('javascript', () => {
    it('should highlight', () => {
      const code = `console.log("Hello World");`;
      const javascript = shallow(syntaxHighlighter(code, 'javascript')).html();

      expect(javascript).toMatchSnapshot();
      expect(shallow(syntaxHighlighter(code, 'ecmascript')).html()).toStrictEqual(javascript);
      expect(shallow(syntaxHighlighter(code, 'js')).html()).toStrictEqual(javascript);
      expect(shallow(syntaxHighlighter(code, 'node')).html()).toStrictEqual(javascript);
      expect(shallow(syntaxHighlighter(code, 'typescript')).html()).toStrictEqual(javascript);
    });

    it('should highlight typescript', () => {
      const code = `let { a, b }: { a: string, b: number } = o;`;

      expect(shallow(syntaxHighlighter(code, 'typescript')).html()).toContain('cm-variable');
    });
  });

  it('json', () => {
    const code = `{ "hello": "world" }`;
    expect(shallow(syntaxHighlighter(code, 'json')).html()).toMatchSnapshot();
  });

  it('kotlin', () => {
    const code = `package hello

fun main() {
  println("Hello World")
}`;

    const kotlin = shallow(syntaxHighlighter(code, 'kotlin')).html();

    expect(kotlin).toMatchSnapshot();
    expect(shallow(syntaxHighlighter(code, 'kt')).html()).toStrictEqual(kotlin);
  });

  it('liquid', () => {
    const code = `{% if user %}
  Hello {{ user.name }}!
{% endif %}`;

    expect(shallow(syntaxHighlighter(code, 'liquid')).html()).toMatchSnapshot();
  });

  it('markdown', () => {
    const code = `# Hello World`;
    expect(shallow(syntaxHighlighter(code, 'markdown')).html()).toMatchSnapshot();
  });

  it('objective-c', () => {
    const code = `/*
 Build on OS X:
 clang -framework Foundation -fobjc-arc objc.m -o objc

 Build on Linux with GNUstep:
 clang \`gnustep-config --objc-flags\` \`gnustep-config --base-libs\` -fobjc-nonfragile-abi -fobjc-arc objc.m -o objc
 */

#import <Foundation/Foundation.h>

int main(void)
{
    NSLog(@"Hello World");
}`;

    const objc = shallow(syntaxHighlighter(code, 'objc')).html();

    expect(objc).toMatchSnapshot();
    expect(shallow(syntaxHighlighter(code, 'objective-c')).html()).toStrictEqual(objc);
    expect(shallow(syntaxHighlighter(code, 'objectivec')).html()).toStrictEqual(objc);
  });

  describe('php', () => {
    it('should highlight', () => {
      const code = `<?php

echo 'Hello World';`;

      expect(shallow(syntaxHighlighter(code, 'php')).html()).toMatchSnapshot();
    });

    it('should highlight if missing an opening `<?php` tag', () => {
      expect(shallow(syntaxHighlighter('echo "Hello World";', 'php')).html()).toContain('cm-keyword');
    });
  });

  it('powershell', () => {
    const code = `'Hello World'`;
    expect(shallow(syntaxHighlighter(code, 'powershell')).html()).toMatchSnapshot();
  });

  it('python', () => {
    const code = `#!/usr/bin/env python
print "Hello World"`;

    const python = shallow(syntaxHighlighter(code, 'python')).html();

    expect(python).toMatchSnapshot();
    expect(shallow(syntaxHighlighter(code, 'py')).html()).toStrictEqual(python);
  });

  it('ruby', () => {
    const code = `#!/usr/bin/env ruby
puts "Hello World"`;

    const ruby = shallow(syntaxHighlighter(code, 'ruby')).html();

    expect(ruby).toMatchSnapshot();
    expect(shallow(syntaxHighlighter(code, 'jruby')).html()).toStrictEqual(ruby);
    expect(shallow(syntaxHighlighter(code, 'macruby')).html()).toStrictEqual(ruby);
    expect(shallow(syntaxHighlighter(code, 'rake')).html()).toStrictEqual(ruby);
    expect(shallow(syntaxHighlighter(code, 'rb')).html()).toStrictEqual(ruby);
    expect(shallow(syntaxHighlighter(code, 'rbx')).html()).toStrictEqual(ruby);
  });

  it('scala', () => {
    const code = `object HelloWorld extends App {
  println("Hello World")
}`;

    expect(shallow(syntaxHighlighter(code, 'scala')).html()).toMatchSnapshot();
  });

  it('shell', () => {
    const code = `#!/bin/sh
echo "Hello World"`;

    const shell = shallow(syntaxHighlighter(code, 'shell')).html();

    expect(shell).toMatchSnapshot();
    expect(shallow(syntaxHighlighter(code, 'bash')).html()).toStrictEqual(shell);
    expect(shallow(syntaxHighlighter(code, 'sh')).html()).toStrictEqual(shell);
    expect(shallow(syntaxHighlighter(code, 'zsh')).html()).toStrictEqual(shell);
  });

  it('sql', () => {
    const code = `SELECT 'Hello World';`;

    const sql = shallow(syntaxHighlighter(code, 'sql')).html();

    expect(sql).toMatchSnapshot();
    expect(shallow(syntaxHighlighter(code, 'cql')).html()).toStrictEqual(sql);
    expect(shallow(syntaxHighlighter(code, 'mssql')).html()).toStrictEqual(sql);
    expect(shallow(syntaxHighlighter(code, 'mysql')).html()).toStrictEqual(sql);
    expect(shallow(syntaxHighlighter(code, 'plsql')).html()).toStrictEqual(sql);
    expect(shallow(syntaxHighlighter(code, 'postgres')).html()).toStrictEqual(sql);
    expect(shallow(syntaxHighlighter(code, 'postgresql')).html()).toStrictEqual(sql);
    expect(shallow(syntaxHighlighter(code, 'pgsql')).html()).toStrictEqual(sql);
    expect(shallow(syntaxHighlighter(code, 'sqlite')).html()).toStrictEqual(sql);
  });

  it('swift', () => {
    const code = `print("Hello World")`;

    expect(shallow(syntaxHighlighter(code, 'swift')).html()).toMatchSnapshot();
  });

  it('xml', () => {
    const code = `<?xml version="1.0" encoding="UTF-8"?>
<text><![CDATA[Hello World]]></text>`;

    expect(shallow(syntaxHighlighter(code, 'xml')).html()).toMatchSnapshot();
  });
});
