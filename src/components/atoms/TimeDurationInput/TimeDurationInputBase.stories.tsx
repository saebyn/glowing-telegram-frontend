import type React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useArgs } from "@storybook/preview-api";
import TimeDurationInputBase from "./TimeDurationInputBase";
import { fn } from "@storybook/test";

const meta = {
  title: "DurationField",
  component: TimeDurationInputBase,
  tags: ["autodocs"],
  argTypes: {
    onChange: { action: "changed" },
    onBlur: { action: "blurred" },
    value: { control: "text" },
  },
  args: {
    value: "PT0S",
    onChange: fn(),
    onBlur: fn(),
  },
} satisfies Meta<typeof TimeDurationInputBase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "PT0S",
  },
};

// story that updates the value of the input with the value from onChange
export const WithValueUpdate: Story = {
  args: {
    value: "PT0S",
  },
  render: function Render(args) {
    const [{ value }, updateArgs] = useArgs();

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      updateArgs({ value: event.target.value });
    };

    return <TimeDurationInputBase {...args} value={value} onChange={onChange} />;
  },
};
