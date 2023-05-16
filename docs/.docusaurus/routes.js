import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/Lox/markdown-page',
    component: ComponentCreator('/Lox/markdown-page', '522'),
    exact: true
  },
  {
    path: '/Lox/repl',
    component: ComponentCreator('/Lox/repl', '9dc'),
    exact: true
  },
  {
    path: '/Lox/docs',
    component: ComponentCreator('/Lox/docs', 'f1a'),
    routes: [
      {
        path: '/Lox/docs/category/lox---basics',
        component: ComponentCreator('/Lox/docs/category/lox---basics', '427'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/Lox/docs/intro',
        component: ComponentCreator('/Lox/docs/intro', '564'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/Lox/docs/lox-basics/classes',
        component: ComponentCreator('/Lox/docs/lox-basics/classes', '2c5'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/Lox/docs/lox-basics/data-structures',
        component: ComponentCreator('/Lox/docs/lox-basics/data-structures', 'c56'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/Lox/docs/lox-basics/for-loop',
        component: ComponentCreator('/Lox/docs/lox-basics/for-loop', '0c2'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/Lox/docs/lox-basics/functions',
        component: ComponentCreator('/Lox/docs/lox-basics/functions', 'f07'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/Lox/docs/lox-basics/print',
        component: ComponentCreator('/Lox/docs/lox-basics/print', '790'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/Lox/docs/lox-basics/standard-library',
        component: ComponentCreator('/Lox/docs/lox-basics/standard-library', 'd79'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/Lox/docs/lox-basics/while-loop',
        component: ComponentCreator('/Lox/docs/lox-basics/while-loop', 'e2b'),
        exact: true,
        sidebar: "tutorialSidebar"
      }
    ]
  },
  {
    path: '/Lox/',
    component: ComponentCreator('/Lox/', '0f1'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];