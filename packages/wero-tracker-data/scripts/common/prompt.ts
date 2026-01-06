import * as prompts from "@clack/prompts";

export async function text(question: string): Promise<string> {
  const result = await prompts.text({
    message: question,
  });

  if (prompts.isCancel(result)) {
    process.exit(0);
  }
  return String(result || "");
}

export async function confirm(question: string): Promise<boolean> {
  const result = await prompts.confirm({
    message: question,
    initialValue: false,
  });

  if (prompts.isCancel(result)) {
    process.exit(0);
  }
  return result;
}

export async function select<Value>(
  question: string,
  options: prompts.Option<Value>[]
): Promise<Value> {
  const result = await prompts.select({
    message: question,
    options: options,
  });

  if (prompts.isCancel(result)) {
    process.exit(0);
  }
  return result;
}

export async function multiselect<Value>(
  question: string,
  options: prompts.Option<Value>[]
): Promise<Value[]> {
  const result = await prompts.multiselect<Value>({
    message: question,
    options: options,
  });

  if (prompts.isCancel(result)) {
    process.exit(0);
  }
  return result;
}

export async function info(message: string): Promise<void> {
  prompts.log.info(message);
}

export async function warn(message: string): Promise<void> {
  prompts.log.warn(message);
}

export async function error(message: string): Promise<void> {
  prompts.log.error(message);
}

export async function success(message: string): Promise<void> {
  prompts.log.success(message);
}
