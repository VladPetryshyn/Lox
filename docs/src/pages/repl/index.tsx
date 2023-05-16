import Layout from "@theme/Layout";
import React from "react";
import { LoxImplementation } from "lox";

export default () => {
  LoxImplementation.run('print "Hello World";');
  return <Layout>

  </Layout>;
}
