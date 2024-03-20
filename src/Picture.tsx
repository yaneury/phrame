interface Props {
  url: string;
}

const Picture = ({ url }: Props) => {
  return (
    <img src={url} />
  )
}

export default Picture;
