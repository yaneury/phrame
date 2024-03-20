interface Props {
  url: string;
}

const Text = ({ url }: Props) => {
  return (
    <iframe src={url}>
    </iframe>
  )
}

export default Text;
